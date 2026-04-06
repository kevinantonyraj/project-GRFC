from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response   import Response
from rest_framework            import status
from django.db.models          import Count, Sum, Q
from django.shortcuts          import get_object_or_404

from .models import (
    Team, Player, Match, Goal, MatchAppearance,
    DailyEntry, Tournament, Staff, Partner
)
from .serializers import (
    TeamSerializer, PlayerSerializer, PlayerStatsSerializer,
    MatchSerializer, DailyEntrySerializer,
    TournamentSerializer, StaffSerializer, PartnerSerializer
)


# ═══════════════════════════════════════════════════════════
#  HOME PAGE
#  Returns last match + season stats + top 3 scorers
# ═══════════════════════════════════════════════════════════
@api_view(['GET'])
def home_data(request):

    # Last match played
    last_match = Match.objects.select_related(
        'home_team', 'away_team'
    ).prefetch_related(
        'goals', 'appearances'
    ).order_by('-date').first()

    # Season stats
    total_goals   = Goal.objects.filter(is_own_goal=False).count()
    total_matches = Match.objects.count()
    total_players = Player.objects.filter(is_active=True).count()

    # Top 3 scorers for home page widget
    top_scorers = Player.objects.annotate(
        total_goals=Count(
            'goals',
            filter=Q(goals__is_own_goal=False)
        )
    ).order_by('-total_goals')[:3].values(
        'id', 'name', 'initials', 'position', 'total_goals'
    )

    return Response({
        'last_match':    MatchSerializer(last_match).data if last_match else None,
        'season_stats':  {
            'total_players': total_players,
            'total_matches': total_matches,
            'total_goals':   total_goals,
        },
        'top_scorers':   list(top_scorers),
    })


# ═══════════════════════════════════════════════════════════
#  DAILY PAGE
#  Returns daily entry by date
#  If no date given returns the most recent entry
# ═══════════════════════════════════════════════════════════
@api_view(['GET'])
def daily_data(request, date=None):

    if date:
        entry = get_object_or_404(DailyEntry, date=date)
    else:
        entry = DailyEntry.objects.order_by('-date').first()
        if not entry:
            return Response(
                {'detail': 'No daily entries found.'},
                status=status.HTTP_404_NOT_FOUND
            )

    # All dates that have entries — for the date ribbon
    all_dates = DailyEntry.objects.order_by('-date').values_list('date', flat=True)

    return Response({
        'entry':     DailyEntrySerializer(entry).data,
        'all_dates': list(all_dates),
    })


# ═══════════════════════════════════════════════════════════
#  MATCHES PAGE
#  Returns all matches with goals + squad
#  Supports filtering by result
# ═══════════════════════════════════════════════════════════
@api_view(['GET'])
def matches_list(request):

    result_filter = request.query_params.get('result', None)

    matches = Match.objects.select_related(
        'home_team', 'away_team'
    ).prefetch_related(
        'goals', 'goals__player',
        'appearances', 'appearances__player', 'appearances__team'
    ).order_by('-date')

    if result_filter and result_filter != 'all':
        matches = matches.filter(result=result_filter)

    return Response(MatchSerializer(matches, many=True).data)


# ═══════════════════════════════════════════════════════════
#  PLAYERS PAGE
#  Returns all active players
# ═══════════════════════════════════════════════════════════
@api_view(['GET'])
def players_list(request):

    
    players = Player.objects.filter(is_active=True).annotate(
        total_appearances = Count('appearances', distinct=True),
        total_goals       = Count('goals', filter=Q(goals__is_own_goal=False), distinct=True),
        total_assists     = Sum('appearances__assists'),
    ).select_related('current_team').order_by('number')

    return Response(PlayerSerializer(players, many=True).data)


# ═══════════════════════════════════════════════════════════
#  PLAYER PROFILE PAGE
#  Returns one player with full match history + stats
# ═══════════════════════════════════════════════════════════
@api_view(['GET'])
def player_profile(request, pk):

    player = get_object_or_404(Player, pk=pk)

    # Match history — last 10 appearances
    appearances = MatchAppearance.objects.filter(
        player=player
    ).select_related(
        'match', 'match__home_team', 'match__away_team', 'team'
    ).order_by('-match__date')[:10]

    match_history = []
    for app in appearances:
        match = app.match
        goals_in_match = Goal.objects.filter(
            match=match, player=player, is_own_goal=False
        ).count()
        match_history.append({
            'date':     match.date.strftime('%b %d, %Y'),
            'opponent': match.away_team.name if match.home_team.is_golden_rock else match.home_team.name,
            'result':   match.result,
            'score':    f"{match.home_score} - {match.away_score}",
            'goals':    goals_in_match,
            'assists':  app.assists,
            'rating':   str(app.rating) if app.rating else '—',
            'is_motm':  app.is_motm,
        })

    # Career stats
    total_goals   = Goal.objects.filter(player=player, is_own_goal=False).count()
    total_assists = MatchAppearance.objects.filter(player=player).aggregate(
        total=Sum('assists')
    )['total'] or 0
    total_matches = MatchAppearance.objects.filter(player=player).count()
    total_motm    = MatchAppearance.objects.filter(player=player, is_motm=True).count()

    return Response({
        'player':        PlayerSerializer(player).data,
        'career_stats':  {
            'total_goals':   total_goals,
            'total_assists': total_assists,
            'total_matches': total_matches,
            'total_motm':    total_motm,
        },
        'match_history': match_history,
    })


# ═══════════════════════════════════════════════════════════
#  HONOURS BOARD
#  Calculates top scorers, top assists, top MOTM
#  from existing Goal + MatchAppearance data
#  Used on Players page honours section
# ═══════════════════════════════════════════════════════════
@api_view(['GET'])
def honours_board(request):

    # Top scorers — count goals excluding own goals
    top_scorers = Player.objects.annotate(
        total_goals=Count(
            'goals',
            filter=Q(goals__is_own_goal=False)
        )
    ).filter(
        total_goals__gt=0
    ).order_by('-total_goals')[:10].values(
        'id', 'name', 'initials', 'position', 'number', 'total_goals'
    )

    # Top assists — sum assists from MatchAppearance
    top_assists = Player.objects.annotate(
        total_assists=Sum('appearances__assists')
    ).filter(
        total_assists__gt=0
    ).order_by('-total_assists')[:10].values(
        'id', 'name', 'initials', 'position', 'number', 'total_assists'
    )

    # Top MOTM — count is_motm=True appearances
    top_motm = Player.objects.annotate(
        total_motm=Count(
            'appearances',
            filter=Q(appearances__is_motm=True)
        )
    ).filter(
        total_motm__gt=0
    ).order_by('-total_motm')[:10].values(
        'id', 'name', 'initials', 'position', 'number', 'total_motm'
    )

    return Response({
        'top_scorers': list(top_scorers),
        'top_assists': list(top_assists),
        'top_motm':    list(top_motm),
    })


# ═══════════════════════════════════════════════════════════
#  SEASON SNAPSHOT
#  Calculates season stats for the snapshot strip
#  Used on Home page and Players page
# ═══════════════════════════════════════════════════════════
@api_view(['GET'])
def season_snapshot(request):

    total_matches  = Match.objects.count()
    total_wins     = Match.objects.filter(result='win').count()
    total_goals    = Goal.objects.filter(is_own_goal=False).count()
    clean_sheets   = Match.objects.filter(
        Q(home_team__is_golden_rock=True, away_score=0) |
        Q(away_team__is_golden_rock=True, home_score=0)
    ).count()

    win_rate       = round((total_wins / total_matches * 100)) if total_matches else 0
    goals_per_game = round(total_goals / total_matches, 1)     if total_matches else 0

    return Response({
        'total_goals':    total_goals,
        'clean_sheets':   clean_sheets,
        'win_rate':       win_rate,
        'goals_per_game': goals_per_game,
        'total_matches':  total_matches,
    })


# ═══════════════════════════════════════════════════════════
#  TOURNAMENTS PAGE
#  Returns all tournaments with squads + teams
#  Supports filtering by result
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
#  CLUB PAGE
#  Returns staff list + partners list
# ═══════════════════════════════════════════════════════════
@api_view(['GET'])
def club_data(request):

    staff    = Staff.objects.all()
    partners = Partner.objects.all().order_by('-last_met')

    return Response({
        'staff':    StaffSerializer(staff,    many=True).data,
        'partners': PartnerSerializer(partners, many=True).data,
    })
