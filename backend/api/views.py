from rest_framework.decorators import api_view
from rest_framework.response   import Response
from rest_framework            import status
from django.db.models          import Count, Sum, Q
from django.shortcuts          import get_object_or_404

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


# ═══════════════════════════════════════════════════════════
#  HOME PAGE
#  — last_match: the most recently inserted match (any type)
#  — season_stats: live from DB (players, matches, goals)
# ═══════════════════════════════════════════════════════════
@api_view(['GET'])
def home_data(request):
    # Latest match regardless of type
    last_match = Match.objects.select_related(
        'home_team', 'away_team'
    ).prefetch_related(
        'goals', 'goals__player', 'goals__team',
        'appearances', 'appearances__player', 'appearances__team'
    ).order_by('-date').first()

    # Live stats from DB
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


# ═══════════════════════════════════════════════════════════
#  DAILY PAGE
#  Shows internal matches only (match_type='internal')
#  Dates ribbon pulls from DailyEntry records
# ═══════════════════════════════════════════════════════════
@api_view(['GET'])
def daily_data(request, date=None):
    date = date or request.query_params.get('date', None)

    if date:
        entry = get_object_or_404(DailyEntry, date=date)
    else:
        entry = DailyEntry.objects.order_by('-date').first()
        if not entry:
            return Response(
                {'detail': 'No daily entries found.'},
                status=status.HTTP_404_NOT_FOUND
            )

    all_dates = list(
        DailyEntry.objects.order_by('-date').values_list('date', flat=True)
    )

    return Response({
        'entry':     DailyEntrySerializer(entry).data,
        'all_dates': [str(d) for d in all_dates],
    })


# ═══════════════════════════════════════════════════════════
#  MATCHES PAGE
#  Excludes internal matches (those go to Daily page)
#  Supports ?result=win|draw|loss filter
# ═══════════════════════════════════════════════════════════
@api_view(['GET'])
def matches_list(request):
    result_filter = request.query_params.get('result', None)

    # Exclude internal matches — they appear on the Daily page
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


# ═══════════════════════════════════════════════════════════
#  PLAYERS LIST — with search + annotated stats
# ═══════════════════════════════════════════════════════════
@api_view(['GET'])
def players_list(request):
    search = request.query_params.get('search', '').strip()

    players = Player.objects.filter(is_active=True).annotate(
        total_appearances=Count('appearances', distinct=True),
        total_goals=Count('goals', filter=Q(goals__is_own_goal=False), distinct=True),
        total_assists=Sum('appearances__assists'),
    ).select_related('current_team').order_by('number')

    if search:
        players = players.filter(
            Q(name__icontains=search) |
            Q(nickname__icontains=search) |
            Q(position__icontains=search)
        )

    return Response(PlayerSerializer(players, many=True).data)


# ═══════════════════════════════════════════════════════════
#  PLAYER PROFILE
# ═══════════════════════════════════════════════════════════
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


# ═══════════════════════════════════════════════════════════
#  HONOURS BOARD
# ═══════════════════════════════════════════════════════════
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


# ═══════════════════════════════════════════════════════════
#  SEASON SNAPSHOT
# ═══════════════════════════════════════════════════════════
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


# ═══════════════════════════════════════════════════════════
#  TOURNAMENTS LIST
# ═══════════════════════════════════════════════════════════
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


# ═══════════════════════════════════════════════════════════
#  TOURNAMENT DETAIL — full match timeline
# ═══════════════════════════════════════════════════════════
@api_view(['GET'])
def tournament_detail(request, pk):
    tournament = get_object_or_404(Tournament, pk=pk)

    tournament_matches = Match.objects.filter(
        match_type='tournament',
        competition=tournament.name
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


# ═══════════════════════════════════════════════════════════
#  CLUB PAGE — staff + partners + assets (dynamic)
# ═══════════════════════════════════════════════════════════
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