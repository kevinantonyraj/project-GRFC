from urllib import response
import requests
from rest_framework.decorators import api_view
from rest_framework.response   import Response
from rest_framework            import status
from django.db.models          import Count, Sum, Q
from django.shortcuts          import get_object_or_404
from django.db.models.functions import Coalesce
from django.db.models import OuterRef, Subquery, IntegerField
from datetime import datetime
from .models import Match



from .models import (
    Team, Player, Match, Goal, MatchAppearance,
    DailyEntry, Tournament, TournamentTeam, TournamentSquad,
    Staff, Partner, ClubAsset
)
from .serializers import (
    TeamSerializer, PlayerSerializer, PlayerStatsSerializer,
    MatchSerializer, DailyEntrySerializer,
    TournamentSerializer, StaffSerializer, PartnerSerializer,
    ClubAssetSerializer
)

@api_view(['GET'])
def home_data(request):
    last_match = Match.objects.select_related(
        'home_team', 'away_team'
    ).prefetch_related(
        'goals', 'goals__player', 'goals__team',
        'appearances', 'appearances__player', 'appearances__team'
    ).order_by('-date').first()

    total_goals   = Goal.objects.filter(is_own_goal=False).count()
    total_matches = Match.objects.count()
    total_players = Player.objects.filter(is_active=True).count()

    top_scorers = Player.objects.annotate(
        total_goals=Count('goals', filter=Q(goals__is_own_goal=False))
    ).order_by('-total_goals')[:3].values(
        'id', 'name', 'initials', 'position', 'total_goals'
    )

    return Response({
        'last_match':   MatchSerializer(last_match).data if last_match else None,
        'season_stats': {
            'total_players': total_players,
            'total_matches': total_matches,
            'total_goals':   total_goals,
        },
        'top_scorers': list(top_scorers),
    })


@api_view(['GET'])
def daily_data(request, date=None):
    date = date or request.query_params.get('date', None)

    all_dates = list(
        DailyEntry.objects
        .order_by('-date')
        .values_list('date', flat=True)
        .distinct()   
    )

    if not all_dates:
        return Response({
            'entry':   [],
            'all_dates': [],
        })

    if date:
        target_date = date
    else:
        target_date = str(all_dates[0])   

    entries = DailyEntry.objects.filter(
        date=target_date
    ).select_related(
        'match', 'match__home_team', 'match__away_team', 'motm_player'
    ).order_by('match__date')   

    return Response({
        'entry':   DailyEntrySerializer(entries, many=True).data,
        'all_dates': [str(d) for d in all_dates],
        'date':      target_date,
    })


@api_view(['GET'])
def matches_list(request):
    result_filter = request.query_params.get('result', None)
    matches = Match.objects.exclude(
        match_type='internal'
    ).select_related(
        'home_team', 'away_team'
    ).prefetch_related(
        'goals', 'goals__player', 'goals__team',
        'appearances', 'appearances__player', 'appearances__team'
    ).order_by('-date')

    if result_filter and result_filter != 'all':
        matches = matches.filter(result=result_filter)

    return Response(MatchSerializer(matches, many=True).data)


@api_view(['GET'])
def players_list(request):
    search = request.query_params.get('search', '').strip()

    assist_subquery = MatchAppearance.objects.filter(
        player=OuterRef('pk')
    ).values('player').annotate(
        total=Sum('assists')
    ).values('total')

    players = Player.objects.filter(is_active=True).annotate(
        total_appearances=Count('appearances', distinct=True),
        total_goals=Count('goals', filter=Q(goals__is_own_goal=False), distinct=True),
        total_assists=Coalesce(Subquery(assist_subquery, output_field=IntegerField()), 0),
    ).select_related('current_team').order_by('number')


    if search:
        players = players.filter(
            Q(name__icontains=search) |
            Q(nickname__icontains=search) |
            Q(position__icontains=search)
        )

    return Response(PlayerSerializer(players, many=True).data)

@api_view(['GET'])
def player_profile(request, pk):
    player = get_object_or_404(Player, pk=pk)

    appearances = MatchAppearance.objects.filter(
        player=player
    ).select_related(
        'match', 'match__home_team', 'match__away_team', 'team'
    ).order_by('-match__date')[:15]

    match_history = []
    for app in appearances:
        match    = app.match
        goals_in = Goal.objects.filter(match=match, player=player, is_own_goal=False).count()
        opponent = match.away_team.name if match.home_team.is_golden_rock else match.home_team.name
        match_history.append({
            'date':     match.date.strftime('%b %d, %Y'),
            'opponent': opponent,
            'result':   match.result,
            'score':    f"{match.home_score} - {match.away_score}",
            'goals':    goals_in,
            'assists':  app.assists,
            'rating':   str(app.rating) if app.rating else '—',
            'is_motm':  app.is_motm,
        })

    total_goals   = Goal.objects.filter(player=player, is_own_goal=False).count()
    total_assists = MatchAppearance.objects.filter(player=player).aggregate(t=Sum('assists'))['t'] or 0
    total_matches = MatchAppearance.objects.filter(player=player).count()
    total_motm    = MatchAppearance.objects.filter(player=player, is_motm=True).count()

    return Response({
        'player':       PlayerSerializer(player).data,
        'career_stats': {
            'total_goals':   total_goals,
            'total_assists': total_assists,
            'total_matches': total_matches,
            'total_motm':    total_motm,
        },
        'match_history': match_history,
    })

@api_view(['GET'])
def honours_board(request):
    top_scorers = list(Player.objects.annotate(
        total_goals=Count('goals', filter=Q(goals__is_own_goal=False))
    ).filter(total_goals__gt=0).order_by('-total_goals').values(
        'id', 'name', 'initials', 'position', 'number', 'total_goals'
    ))

    top_assists = list(Player.objects.annotate(
        total_assists=Sum('appearances__assists')
    ).filter(total_assists__gt=0).order_by('-total_assists').values(
        'id', 'name', 'initials', 'position', 'number', 'total_assists'
    ))

    top_motm = list(Player.objects.annotate(
        total_motm=Count('appearances', filter=Q(appearances__is_motm=True))
    ).filter(total_motm__gt=0).order_by('-total_motm').values(
        'id', 'name', 'initials', 'position', 'number', 'total_motm'
    ))

    return Response({
        'top_scorers': top_scorers,
        'top_assists': top_assists,
        'top_motm':    top_motm,
    })

@api_view(['GET'])
def season_snapshot(request):
    total_matches = Match.objects.count()
    total_wins    = Match.objects.filter(result='win').count()
    total_goals   = Goal.objects.filter(is_own_goal=False).count()
    clean_sheets  = Match.objects.filter(
        Q(home_team__is_golden_rock=True, away_score=0) |
        Q(away_team__is_golden_rock=True, home_score=0)
    ).count()

    win_rate       = round((total_wins / total_matches * 100)) if total_matches else 0
    goals_per_game = round(total_goals / total_matches, 1) if total_matches else 0

    return Response({
        'total_goals':    total_goals,
        'clean_sheets':   clean_sheets,
        'win_rate':       win_rate,
        'goals_per_game': goals_per_game,
        'total_matches':  total_matches,
    })

@api_view(['GET'])
def tournaments_list(request):
    result_filter = request.query_params.get('result', None)

    tournaments = Tournament.objects.prefetch_related(
        'tournament_squads', 'tournament_squads__player',
        'tournament_teams',  'tournament_teams__team',
    ).order_by('-year')

    if result_filter and result_filter != 'all':
        tournaments = tournaments.filter(result=result_filter)

    return Response(TournamentSerializer(tournaments, many=True).data)

@api_view(['GET'])
def tournament_detail(request, pk):
    tournament = get_object_or_404(Tournament, pk=pk)

    tournament_matches = Match.objects.filter(
        
        tournament=tournament
    ).select_related(
        'home_team', 'away_team'
    ).prefetch_related(
        'goals', 'goals__player',
        'appearances', 'appearances__player'
    ).order_by('date')

    stages = []
    for match in tournament_matches:
        stages.append({
            'id':             match.id,
            'date':           match.date.strftime('%b %d, %Y'),
            'competition':    match.competition,
            'tournament_name': tournament.name, 
            'home_team_name': match.home_team.name,
            'home_team_code': match.home_team.short_code,
            'away_team_name': match.away_team.name,
            'away_team_code': match.away_team.short_code,
            'home_score':     match.home_score,
            'away_score':     match.away_score,
            'result':         match.result,
            'venue':          match.venue,
            'goals': [
                {'player_name': g.player.name, 'minute': g.minute, 'team': g.team.name}
                for g in match.goals.filter(is_own_goal=False)
            ],
            'motm': next(
                (a.player.name for a in match.appearances.all() if a.is_motm), None
            ),
        })

    return Response({
        'tournament': TournamentSerializer(tournament).data,
        'matches':    stages,
    })

@api_view(['GET'])
def club_data(request):
    staff    = Staff.objects.all()
    partners = Partner.objects.all().order_by('-last_met')
    assets   = ClubAsset.objects.all()
    return Response({
        'staff':    StaffSerializer(staff, many=True).data,
        'partners': PartnerSerializer(partners, many=True).data,
        'assets':   ClubAssetSerializer(assets, many=True).data,
    })

@api_view(['POST'])
def send_whatsapp(request):
    try:
        data = request.data
        match_id = data.get('id')

        match = Match.objects.select_related(
            'home_team', 'away_team'
        ).prefetch_related(
            'goals__player', 'goals__team',
            'appearances__player', 'appearances__team'
        ).get(id=match_id)

        if match.match_type != 'internal':
            return Response({"error": "Only internal matches allowed"}, status=400)

        date_str = match.date.strftime("%d %b %Y")
        home_appearances = match.appearances.filter(team=match.home_team)
        away_appearances = match.appearances.filter(team=match.away_team)

        def format_player(app):
            tag = " ⭐" if app.is_motm else ""
            sub = " (sub)" if app.is_substitute else ""
            assists = f" — {app.assists}A" if app.assists > 0 else ""
            return f"  • {app.player.name}{tag}{sub}{assists}"

        home_squad = "\n".join(format_player(a) for a in home_appearances)
        away_squad = "\n".join(format_player(a) for a in away_appearances)

        if not home_squad:
            home_squad = "  • Not recorded"
        if not away_squad:
            away_squad = "  • Not recorded"

        home_goals = match.goals.filter(team=match.home_team).order_by('minute')
        away_goals = match.goals.filter(team=match.away_team).order_by('minute')

        def format_goal(g):
            og = " (OG)" if g.is_own_goal else ""
            return f"  ⚽ {g.player.name}{og} {g.minute}'"

        home_goals_text = "\n".join(format_goal(g) for g in home_goals)
        away_goals_text = "\n".join(format_goal(g) for g in away_goals)

        if not home_goals_text:
            home_goals_text = "  • No goals"
        if not away_goals_text:
            away_goals_text = "  • No goals"

        motm_appearance = match.appearances.filter(is_motm=True).first()
        motm_name = motm_appearance.player.name if motm_appearance else "----"

        top_assisters = match.appearances.filter(assists__gt=0).order_by('-assists')
        if top_assisters.exists():
            assist_text = "\n".join(
                f"  • {a.player.name} — {a.assists} assist{'s' if a.assists > 1 else ''}"
                for a in top_assisters
            )
        else:
            assist_text = "  • Not recorded"

        message = f"""{date_str} MATCH RESULT

{match.home_team.name} vs {match.away_team.name}
{match.home_score} - {match.away_score}
 
Goals — {match.home_team.name}:
{home_goals_text}

Goals — {match.away_team.name}:
{away_goals_text}

Assists:
{assist_text}

Team 1 Squad:
{home_squad}

Team 2 Squad:
{away_squad}


🔥 Man of the Match: {motm_name}
"""

        payload = {
            "groupId": "120363426722567735@g.us",
            "message": message
        }

        print("---- SENDING TO NODE ----")
        response = requests.post(
            "http://localhost:5001/send-group",
            json=payload,
            timeout=10
        )
        print("NODE RESPONSE:", response.status_code, repr(response.text))

        return Response({
            "success": True,
            "node_status": response.status_code,
            "node_response": response.text
        })

    except Match.DoesNotExist:
        return Response({"error": "Match not found"}, status=404)
    except requests.exceptions.ConnectionError:
        return Response({"error": "Cannot reach WhatsApp service on port 5001"}, status=503)
    except Exception as e:
        print("ERROR:", str(e))
        return Response({"error": str(e)}, status=500)