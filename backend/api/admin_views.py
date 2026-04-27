"""
admin_views.py  —  Full CRUD API for the Golden Rock FC Admin Portal
Place this file inside your api/ folder.

KEY FIX: datetime-local HTML input sends "2026-07-05T06:00" (ISO 8601 with T).
Django's DateTimeField.save() can struggle with this on some DB backends.
We use django.utils.dateparse.parse_datetime which handles the T separator
correctly, and fall back to a manual replace if needed.
"""
from rest_framework.decorators import api_view,permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response   import Response
from django.shortcuts          import get_object_or_404
from django.utils.dateparse   import parse_datetime
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth.models import User
from django.contrib.auth import authenticate


from .models import (
    Team, Player, Match, Goal, MatchAppearance,
    DailyEntry, Tournament, TournamentTeam, TournamentSquad,
    Staff, Partner, ClubAsset
)
from .serializers import (
    TeamSerializer, PlayerSerializer, MatchSerializer,
    TournamentSerializer, StaffSerializer, PartnerSerializer,
    ClubAssetSerializer
)


# ── helpers ──────────────────────────────────────────────────
def ok(data=None, msg='Success', status_code=200):
    return Response({'success': True,  'message': msg, 'data': data}, status=status_code)

def err(msg='Error', status_code=400):
    return Response({'success': False, 'message': msg, 'data': None}, status=status_code)

def parse_dt(value):
    """
    Safely parse a datetime string coming from an HTML datetime-local input.
    The browser sends "2026-07-05T06:00" — we normalise it so Django accepts it.
    """
    if not value:
        raise ValueError('date is required')
    # django's parse_datetime handles ISO 8601 with T separator
    dt = parse_datetime(str(value).strip())
    if dt is None:
        # fallback: replace T with space and try again
        dt = parse_datetime(str(value).strip().replace('T', ' '))
    if dt is None:
        raise ValueError(f"Cannot parse date '{value}'. Use format: YYYY-MM-DDTHH:MM")
    return dt


# ═══════════════════════════════════════════════════════════
#  BOOTSTRAP
# ═══════════════════════════════════════════════════════════
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_bootstrap(request):
    teams   = Team.objects.all().values('id', 'name', 'short_code', 'is_golden_rock')
    players = Player.objects.filter(is_active=True).values('id', 'name', 'initials', 'position', 'number')
    matches = Match.objects.select_related('home_team', 'away_team').order_by('-date').values(
        'id', 'date', 'competition', 'home_team__name', 'away_team__name', 'result'
    )[:50]
    tournaments = Tournament.objects.values('id', 'name', 'year').order_by('-year')  # ← ADD

    return ok({
        'teams':   list(teams),
        'players': list(players),
        'matches': list(matches),
        'tournaments': list(tournaments),
    })


# ═══════════════════════════════════════════════════════════
#  TEAMS
# ═══════════════════════════════════════════════════════════
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])

def team_list_create(request):
    if request.method == 'GET':
        return ok(TeamSerializer(Team.objects.all(), many=True).data)
    s = TeamSerializer(data=request.data)
    if s.is_valid():
        s.save()
        return ok(s.data, 'Team created', 201)
    return err(str(s.errors))

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def team_detail(request, pk):
    team = get_object_or_404(Team, pk=pk)
    if request.method == 'GET':
        return ok(TeamSerializer(team).data)
    if request.method == 'PUT':
        s = TeamSerializer(team, data=request.data, partial=True)
        if s.is_valid():
            s.save()
            return ok(s.data, 'Team updated')
        return err(str(s.errors))
    team.delete()
    return ok(msg='Team deleted')


# ═══════════════════════════════════════════════════════════
#  PLAYERS
# ═══════════════════════════════════════════════════════════
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def player_list_create(request):
    if request.method == 'GET':
        return ok(PlayerSerializer(Player.objects.select_related('current_team').all(), many=True).data)
    s = PlayerSerializer(data=request.data)
    if s.is_valid():
        s.save()
        return ok(s.data, 'Player created', 201)
    return err(str(s.errors))

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def player_detail(request, pk):
    player = get_object_or_404(Player, pk=pk)
    if request.method == 'GET':
        return ok(PlayerSerializer(player).data)
    if request.method == 'PUT':
        s = PlayerSerializer(player, data=request.data, partial=True)
        if s.is_valid():
            s.save()
            return ok(s.data, 'Player updated')
        return err(str(s.errors))
    player.delete()
    return ok(msg='Player deleted')


# ═══════════════════════════════════════════════════════════
#  MATCHES
#  ROOT FIX: parse the datetime-local string with parse_dt()
#  before passing to Match.objects.create()
# ═══════════════════════════════════════════════════════════
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def match_list_create(request):
    if request.method == 'GET':
        matches = Match.objects.select_related('home_team', 'away_team').order_by('-date')
        return ok(MatchSerializer(matches, many=True).data)

    try:
        data = request.data

        # ── CRITICAL FIX ──────────────────────────────────
        # The browser datetime-local input sends "2026-07-05T06:00"
        # parse_dt() converts this to a proper Python datetime object
        # so Django can save it to PostgreSQL without error
        parsed_date = parse_dt(data.get('date', ''))

        # Validate required fields before creating
        if not data.get('competition'):
            return err('Competition is required')
        if not data.get('venue'):
            return err('Venue is required')
        if not data.get('home_team'):
            return err('Home team is required')
        if not data.get('away_team'):
            return err('Away team is required')
        if str(data.get('home_team')) == str(data.get('away_team')):
            return err('Home and away teams must be different')
        
        match_type = data.get('match_type', 'external')

        tournament_id = None
        if match_type == 'tournament' and data.get('tournament_id'):
            tournament_id = int(data['tournament_id'])

        match = Match.objects.create(
            date         = parsed_date,          # ← proper datetime object
            competition  = data['competition'],
            venue        = data['venue'],
            home_team_id = int(data['home_team']),
            away_team_id = int(data['away_team']),
            home_score   = int(data.get('home_score', 0)),
            away_score   = int(data.get('away_score', 0)),
            result       = data.get('result', 'win'),
            match_type   = data.get('match_type', 'external'),
            notes        = data.get('notes', ''),
            tournament_id = tournament_id,
        )
        if match_type == 'internal':
            DailyEntry.objects.create(
                match       = match,
                date        = parsed_date.date(),   # DateField — just the date part
                competition = data['competition'],
                notes       = data.get('notes', ''),
            )
        return ok(
            {'id': match.id, 'display': str(match)},
            f'Match recorded: {match.home_team.name} vs {match.away_team.name}',
            201
        )
    except ValueError as e:
        return err(str(e))
    except KeyError as e:
        return err(f'Missing required field: {e}')
    except Exception as e:
        return err(f'Error saving match: {str(e)}')


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def match_detail(request, pk):
    match = get_object_or_404(Match, pk=pk)
    if request.method == 'GET':
        return ok(MatchSerializer(match).data)
    if request.method == 'PUT':
        try:
            data = request.data
            if 'date' in data:
                match.date = parse_dt(data['date'])
            for field in ['competition', 'venue', 'home_score', 'away_score', 'result', 'match_type', 'notes']:
                if field in data:
                    setattr(match, field, data[field])
            if 'home_team' in data:
                match.home_team_id = int(data['home_team'])
            if 'away_team' in data:
                match.away_team_id = int(data['away_team'])
            match.save()
            return ok(MatchSerializer(match).data, 'Match updated')
        except Exception as e:
            return err(str(e))
    match.delete()
    return ok(msg='Match deleted')


# ═══════════════════════════════════════════════════════════
#  GOALS
# ═══════════════════════════════════════════════════════════
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def goal_list_create(request):
    match_id = request.query_params.get('match_id')
    if request.method == 'GET':
        goals = Goal.objects.select_related('player', 'team', 'match')
        if match_id:
            goals = goals.filter(match_id=match_id)
        return ok([{
            'id': g.id, 'match_id': g.match_id,
            'player_id': g.player_id, 'player_name': g.player.name,
            'team_id': g.team_id, 'team_name': g.team.name,
            'minute': g.minute, 'is_own_goal': g.is_own_goal,
        } for g in goals.order_by('minute')])

    try:
        goal = Goal.objects.create(
            match_id    = int(request.data['match_id']),
            player_id   = int(request.data['player_id']),
            team_id     = int(request.data['team_id']),
            minute      = int(request.data['minute']),
            is_own_goal = request.data.get('is_own_goal', False),
        )
        return ok({'id': goal.id}, 'Goal added', 201)
    except Exception as e:
        return err(str(e))

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def goal_delete(request, pk):
    get_object_or_404(Goal, pk=pk).delete()
    return ok(msg='Goal deleted')


# ═══════════════════════════════════════════════════════════
#  APPEARANCES
# ═══════════════════════════════════════════════════════════
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def appearance_list_create(request):
    match_id = request.query_params.get('match_id')
    if request.method == 'GET':
        apps = MatchAppearance.objects.select_related('player', 'team')
        if match_id:
            apps = apps.filter(match_id=match_id)
        return ok([{
            'id': a.id, 'match_id': a.match_id,
            'player_id': a.player_id, 'player_name': a.player.name,
            'team_id': a.team_id, 'team_name': a.team.name,
            'rating': str(a.rating) if a.rating else '',
            'assists': a.assists, 'is_motm': a.is_motm,
            'is_substitute': a.is_substitute,
        } for a in apps.order_by('player__name')])

    try:
        app, _ = MatchAppearance.objects.update_or_create(
            match_id  = int(request.data['match_id']),
            player_id = int(request.data['player_id']),
            team_id   = int(request.data['team_id']),
            defaults  = {
                'rating':        request.data.get('rating') or None,
                'assists':       int(request.data.get('assists', 0)),
                'is_motm':       bool(request.data.get('is_motm', False)),
                'is_substitute': bool(request.data.get('is_substitute', False)),
            }
        )
        return ok({'id': app.id}, 'Appearance saved', 201)
    except Exception as e:
        return err(str(e))

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def appearance_delete(request, pk):
    get_object_or_404(MatchAppearance, pk=pk).delete()
    return ok(msg='Appearance deleted')


# ═══════════════════════════════════════════════════════════
#  DAILY ENTRY
# ═══════════════════════════════════════════════════════════
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def daily_entry_manage(request):
    if request.method == 'GET':
        match_id = request.query_params.get('match_id')
        if not match_id:
            entries = DailyEntry.objects.select_related('match', 'motm_player').order_by('-date')
            return ok([{
                'id': e.id, 'date': str(e.date), 'competition': e.competition,
                'notes': e.notes, 'match_id': e.match_id,
                'motm_player_id': e.motm_player_id,
                'motm_player_name': e.motm_player.name if e.motm_player else '',
                'motm_goals': e.motm_goals, 'motm_assists': e.motm_assists,
                'motm_rating': str(e.motm_rating) if e.motm_rating else '',
            } for e in entries])
        entry = DailyEntry.objects.filter(match_id=match_id).first()
        if not entry:
            return ok(None)
        return ok({
            'id': entry.id, 'date': str(entry.date),
            'competition': entry.competition, 'notes': entry.notes,
            'match_id': entry.match_id,
            'motm_player_id': entry.motm_player_id,
            'motm_goals': entry.motm_goals, 'motm_assists': entry.motm_assists,
            'motm_rating': str(entry.motm_rating) if entry.motm_rating else '',
        })

    try:
        entry, _ = DailyEntry.objects.update_or_create(
            match_id = int(request.data['match_id']),
            defaults = {
                'date':           request.data['date'],
                'competition':    request.data['competition'],
                'notes':          request.data.get('notes', ''),
                'motm_player_id': request.data.get('motm_player_id') or None,
                'motm_goals':     int(request.data.get('motm_goals', 0)),
                'motm_assists':   int(request.data.get('motm_assists', 0)),
                'motm_rating':    request.data.get('motm_rating') or None,
            }
        )
        return ok({'id': entry.id}, 'Daily entry saved', 201)
    except Exception as e:
        return err(str(e))

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def daily_entry_delete(request, pk):
    get_object_or_404(DailyEntry, pk=pk).delete()
    return ok(msg='Daily entry deleted')


# ═══════════════════════════════════════════════════════════
#  TOURNAMENTS
# ═══════════════════════════════════════════════════════════
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def tournament_list_create(request):
    if request.method == 'GET':
        t = Tournament.objects.prefetch_related('tournament_squads', 'tournament_teams').order_by('-year')
        return ok(TournamentSerializer(t, many=True).data)
    s = TournamentSerializer(data=request.data)
    if s.is_valid():
        s.save()
        return ok(s.data, 'Tournament created', 201)
    return err(str(s.errors))

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def tournament_detail_manage(request, pk):
    t = get_object_or_404(Tournament, pk=pk)
    if request.method == 'GET':
        return ok(TournamentSerializer(t).data)
    if request.method == 'PUT':
        s = TournamentSerializer(t, data=request.data, partial=True)
        if s.is_valid():
            s.save()
            return ok(s.data, 'Tournament updated')
        return err(str(s.errors))
    t.delete()
    return ok(msg='Tournament deleted')

@api_view(['POST', 'DELETE'])
@permission_classes([IsAuthenticated])
def tournament_squad_manage(request):
    if request.method == 'POST':
        try:
            ts, _ = TournamentSquad.objects.get_or_create(
                tournament_id=int(request.data['tournament_id']),
                player_id=int(request.data['player_id']),
            )
            return ok({'id': ts.id}, 'Player added to squad', 201)
        except Exception as e:
            return err(str(e))
    try:
        TournamentSquad.objects.filter(
            tournament_id=int(request.data['tournament_id']),
            player_id=int(request.data['player_id']),
        ).delete()
        return ok(msg='Player removed from squad')
    except Exception as e:
        return err(str(e))

@api_view(['POST', 'DELETE'])
@permission_classes([IsAuthenticated])
def tournament_team_manage(request):
    if request.method == 'POST':
        try:
            tt, _ = TournamentTeam.objects.get_or_create(
                tournament_id=int(request.data['tournament_id']),
                team_id=int(request.data['team_id']),
                defaults={'final_position': request.data.get('final_position')},
            )
            return ok({'id': tt.id}, 'Team added', 201)
        except Exception as e:
            return err(str(e))
    try:
        TournamentTeam.objects.filter(
            tournament_id=int(request.data['tournament_id']),
            team_id=int(request.data['team_id']),
        ).delete()
        return ok(msg='Team removed')
    except Exception as e:
        return err(str(e))


# ═══════════════════════════════════════════════════════════
#  STAFF
# ═══════════════════════════════════════════════════════════
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def staff_list_create(request):
    if request.method == 'GET':
        return ok(StaffSerializer(Staff.objects.all(), many=True).data)
    s = StaffSerializer(data=request.data)
    if s.is_valid():
        s.save()
        return ok(s.data, 'Staff member added', 201)
    return err(str(s.errors))

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def staff_detail(request, pk):
    staff = get_object_or_404(Staff, pk=pk)
    if request.method == 'GET':
        return ok(StaffSerializer(staff).data)
    if request.method == 'PUT':
        s = StaffSerializer(staff, data=request.data, partial=True)
        if s.is_valid():
            s.save()
            return ok(s.data, 'Staff updated')
        return err(str(s.errors))
    staff.delete()
    return ok(msg='Staff deleted')


# ═══════════════════════════════════════════════════════════
#  PARTNERS
# ═══════════════════════════════════════════════════════════
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def partner_list_create(request):
    if request.method == 'GET':
        return ok(PartnerSerializer(Partner.objects.all().order_by('-last_met'), many=True).data)
    s = PartnerSerializer(data=request.data)
    if s.is_valid():
        s.save()
        return ok(s.data, 'Partner added', 201)
    return err(str(s.errors))

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def partner_detail(request, pk):
    partner = get_object_or_404(Partner, pk=pk)
    if request.method == 'GET':
        return ok(PartnerSerializer(partner).data)
    if request.method == 'PUT':
        s = PartnerSerializer(partner, data=request.data, partial=True)
        if s.is_valid():
            s.save()
            return ok(s.data, 'Partner updated')
        return err(str(s.errors))
    partner.delete()
    return ok(msg='Partner deleted')


# ═══════════════════════════════════════════════════════════
#  CLUB ASSETS
#  Fixed 4 options: Match Balls, Training Nets, Cones & Markers,
#  First Aid Kits — no free-text label field
# ═══════════════════════════════════════════════════════════
ASSET_OPTIONS = [
    {'label': 'Match Balls',     'icon': '⚽'},
    {'label': 'Training Nets',   'icon': '🥅'},
    {'label': 'Cones & Markers', 'icon': '🔶'},
    {'label': 'First Aid Kits',  'icon': '🩺'},
]

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def asset_list_create(request):
    if request.method == 'GET':
        return ok(ClubAssetSerializer(ClubAsset.objects.all(), many=True).data)

    # The label and icon come from the fixed option selected
    # Frontend sends: { asset_type: "Match Balls", count: 18 }
    try:
        asset_type = request.data.get('asset_type', '')
        option     = next((o for o in ASSET_OPTIONS if o['label'] == asset_type), None)
        if not option:
            return err(f'Invalid asset type. Choose from: {[o["label"] for o in ASSET_OPTIONS]}')
        count = int(request.data.get('count', 0))
        if count < 0:
            return err('Count cannot be negative')

        # Update existing if same label exists, else create
        asset, created = ClubAsset.objects.update_or_create(
            label=option['label'],
            defaults={'icon': option['icon'], 'count': count, 'order': ASSET_OPTIONS.index(option)},
        )
        verb = 'added' if created else 'updated'
        return ok(ClubAssetSerializer(asset).data, f'{option["label"]} {verb}', 201)
    except Exception as e:
        return err(str(e))

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def asset_detail(request, pk):
    asset = get_object_or_404(ClubAsset, pk=pk)
    if request.method == 'GET':
        return ok(ClubAssetSerializer(asset).data)
    if request.method == 'PUT':
        try:
            count = int(request.data.get('count', asset.count))
            asset.count = count
            asset.save()
            return ok(ClubAssetSerializer(asset).data, 'Asset updated')
        except Exception as e:
            return err(str(e))
    asset.delete()
    return ok(msg='Asset deleted')



# ═══════════════════════════════════════════════════════════
#  AUTH — Login, Verify, Logout
# ═══════════════════════════════════════════════════════════

@api_view(['POST'])
def admin_login(request):
    """
    Accepts { email, password }.
    Checks against Django User table.
    Returns JWT access + refresh tokens on success.
    """
    email    = request.data.get('email', '').strip().lower()
    password = request.data.get('password', '')

    if not email or not password:
        return err('Email and password are required', 400)

    # Django auth uses username — look up user by email first
    try:
        user = User.objects.get(email__iexact=email)
    except User.DoesNotExist:
        return err('Invalid credentials', 401)

    # Check password and active status
    user = authenticate(username=user.username, password=password)
    if user is None:
        return err('Invalid credentials', 401)

    if not user.is_active:
        return err('Account is disabled', 403)

    if not user.is_staff:
        return err('Access denied — admin accounts only', 403)

    # Generate JWT tokens
    refresh = RefreshToken.for_user(user)
    return ok({
        'access':  str(refresh.access_token),
        'refresh': str(refresh),
        'user': {
            'email':      user.email,
            'username':   user.username,
            'first_name': user.first_name,
            'last_name':  user.last_name,
        }
    }, 'Login successful')


@api_view(['GET'])
def admin_verify(request):
    """
    Verifies the JWT token sent in Authorization header.
    Returns user info if valid, 401 if not.
    Used by adminportal.jsx on every page load.
    """
    

    try:
        auth = JWTAuthentication()
        result = auth.authenticate(request)
        if result is None:
            return err('No token provided', 401)
        user, token = result
        if not user.is_active or not user.is_staff:
            return err('Access denied', 403)
        return ok({
            'email':      user.email,
            'username':   user.username,
            'first_name': user.first_name,
        }, 'Token valid')
    except Exception:
        return err('Invalid or expired token', 401)


@api_view(['POST'])
def admin_logout(request):
    """
    Blacklists the refresh token so it cannot be reused.
    """
    try:
        refresh_token = request.data.get('refresh')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        return ok(msg='Logged out successfully')
    except Exception:
        return ok(msg='Logged out')