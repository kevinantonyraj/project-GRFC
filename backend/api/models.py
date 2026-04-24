from django.db import models


# ═══════════════════════════════════════════════════════════
#  TEAM
#  Stores every team — both Golden Rock squads and opponents
#  Same team can appear in unlimited matches via FK reference
# ═══════════════════════════════════════════════════════════
class Team(models.Model):
    name           = models.CharField(max_length=100)
    short_code     = models.CharField(max_length=5)        # GR, RS, IW
    badge_bg       = models.CharField(max_length=200, blank=True)
    is_golden_rock = models.BooleanField(default=False)    # True = internal squad

    def __str__(self):
        return self.name


# ═══════════════════════════════════════════════════════════
#  PLAYER
#  Stores every Golden Rock FC player once.
#  current_team is only for display on Players page squad grid.
#  Actual per-match team is stored in MatchAppearance.
#sample
# ═══════════════════════════════════════════════════════════
class Player(models.Model):
    POSITION_CHOICES = [
        ('GK',  'Goalkeeper'),
        ('DEF', 'Defender'),
        ('MID', 'Midfielder'),
        ('FWD', 'Forward'),
    ]

    name         = models.CharField(max_length=100)
    nickname     = models.CharField(max_length=100, blank=True, null=True)
    initials     = models.CharField(max_length=3)
    position     = models.CharField(max_length=3, choices=POSITION_CHOICES)
    number       = models.IntegerField()
    role_tag     = models.CharField(max_length=50, blank=True, null=True)
    joined_year  = models.IntegerField()
    avatar_bg    = models.CharField(max_length=200, blank=True)
    is_featured  = models.BooleanField(default=False)
    is_active    = models.BooleanField(default=True)

    # Only for display on Players page — NOT used for match data
    current_team = models.ForeignKey(
        Team,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='current_players'
    )

    def __str__(self):
        return self.name


# ═══════════════════════════════════════════════════════════
#  MATCH
#  One row per match played.
#  home_team and away_team both reference the Team table.
#  Same two teams can play unlimited times — each is a new row.
#  match_type tells us if it's internal (GR vs GR) or external.
# ═══════════════════════════════════════════════════════════
class Match(models.Model):
    RESULT_CHOICES = [
        ('win',  'Win'),
        ('draw', 'Draw'),
        ('loss', 'Loss'),
    ]

    MATCH_TYPE_CHOICES = [
        ('internal',    'Internal'),     # GR First Team vs GR Reserve
        ('external',    'External'),     # GR vs opponent
        ('friendly',    'Friendly'),     # friendly match
        ('tournament',  'Tournament'),   # tournament match
    ]

    date        = models.DateTimeField()
    competition = models.CharField(max_length=100)
    venue       = models.CharField(max_length=100)

    # Both reference Team table — handles internal and external matches
    home_team   = models.ForeignKey(
        Team,
        on_delete=models.CASCADE,
        related_name='home_matches'
    )
    away_team   = models.ForeignKey(
        Team,
        on_delete=models.CASCADE,
        related_name='away_matches'
    )

    home_score  = models.IntegerField(default=0)
    away_score  = models.IntegerField(default=0)
    result      = models.CharField(max_length=4,  choices=RESULT_CHOICES)
    match_type  = models.CharField(max_length=12, choices=MATCH_TYPE_CHOICES, default='external')
    notes       = models.TextField(blank=True, null=True)

    tournament  = models.ForeignKey(
        'Tournament',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='matches'
    )
    
    def __str__(self):
        return f"{self.home_team.name} vs {self.away_team.name} — {self.date.date()}"


# ═══════════════════════════════════════════════════════════
#  GOAL
#  Every goal scored in every match.
#  team field tells which side of the match scored —
#  critical for internal matches where both teams are GR squads.
#  is_own_goal excluded from top scorer calculations.
# ═══════════════════════════════════════════════════════════
class Goal(models.Model):
    match       = models.ForeignKey(Match,  on_delete=models.CASCADE, related_name='goals')
    player      = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='goals')
    team        = models.ForeignKey(Team,   on_delete=models.CASCADE, related_name='goals')
    minute      = models.IntegerField()
    is_own_goal = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.player.name} {self.minute}' ({self.team.name})"


# ═══════════════════════════════════════════════════════════
#  MATCH APPEARANCE
#  Which player played in which match for which team.
#  This is where per-match team assignment lives —
#  same player can be team=FirstTeam one day
#  and team=ReserveTeam the next day.
#  Used to calculate top assists and MOTM awards.
# ═══════════════════════════════════════════════════════════
class MatchAppearance(models.Model):
    match         = models.ForeignKey(Match,  on_delete=models.CASCADE, related_name='appearances')
    player        = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='appearances')
    team          = models.ForeignKey(Team,   on_delete=models.CASCADE, related_name='appearances')
    rating        = models.DecimalField(max_digits=3, decimal_places=1, blank=True, null=True)
    assists       = models.IntegerField(default=0)
    is_motm       = models.BooleanField(default=False)
    is_substitute = models.BooleanField(default=False)

    class Meta:
        # A player can only appear once per match per team
        unique_together = ('match', 'player', 'team')

    def __str__(self):
        return f"{self.player.name} — {self.match}"


# ═══════════════════════════════════════════════════════════
#  DAILY ENTRY
#  Extra details for the Daily page view.
#  One entry per match (OneToOne).
#  Keeps the Match table clean — not every match
#  needs daily notes.
# ═══════════════════════════════════════════════════════════
class DailyEntry(models.Model):
    match        = models.OneToOneField(Match,  on_delete=models.CASCADE, related_name='daily_entry')
    date         = models.DateField()
    competition  = models.CharField(max_length=100)
    notes        = models.TextField(blank=True)
    motm_player  = models.ForeignKey(
        Player,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='motm_entries'
    )
    motm_goals   = models.IntegerField(default=0)
    motm_assists = models.IntegerField(default=0)
    motm_rating  = models.DecimalField(max_digits=3, decimal_places=1, null=True, blank=True)

    def __str__(self):
        return f"Daily Entry — {self.date}"


# ═══════════════════════════════════════════════════════════
#  TOURNAMENT
#  One row per tournament entered.
#  Links to teams via TournamentTeam (all participants).
#  Links to players via TournamentSquad (GR squad only).
# ═══════════════════════════════════════════════════════════
class Tournament(models.Model):
    RESULT_CHOICES = [
        ('champions', 'Champions'),
        ('runners',   'Runners Up'),
        ('semis',     'Semi Finals'),
        ('quarters',  'Quarter Finals'),
    ]

    name          = models.CharField(max_length=100)
    result        = models.CharField(max_length=10, choices=RESULT_CHOICES)
    dates         = models.CharField(max_length=100)
    venue         = models.CharField(max_length=100)
    total_teams   = models.IntegerField(default=0)
    total_matches = models.IntegerField(default=0)
    total_goals   = models.IntegerField(default=0)
    year          = models.IntegerField()

    # All participating teams
    teams  = models.ManyToManyField(Team,   through='TournamentTeam',  blank=True)
    # Golden Rock players selected for this tournament
    squad  = models.ManyToManyField(Player, through='TournamentSquad', blank=True)

    def __str__(self):
        return f"{self.name} ({self.year})"


# ═══════════════════════════════════════════════════════════
#  TOURNAMENT TEAM
#  Maps which teams participated in which tournament.
#  final_position tracks where each team finished.
#  e.g. GR = 1st, Royal Strikers = 2nd etc.
# ═══════════════════════════════════════════════════════════
class TournamentTeam(models.Model):
    tournament     = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name='tournament_teams')
    team           = models.ForeignKey(Team,       on_delete=models.CASCADE, related_name='tournament_teams')
    final_position = models.IntegerField(null=True, blank=True)

    class Meta:
        unique_together = ('tournament', 'team')

    def __str__(self):
        return f"{self.team.name} in {self.tournament.name}"


# ═══════════════════════════════════════════════════════════
#  TOURNAMENT SQUAD
#  Maps which Golden Rock players were in each tournament squad.
#  Same player can be in multiple tournament squads —
#  no duplication in Player table.
# ═══════════════════════════════════════════════════════════
class TournamentSquad(models.Model):
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name='tournament_squads')
    player     = models.ForeignKey(Player,     on_delete=models.CASCADE, related_name='tournament_squads')

    class Meta:
        unique_together = ('tournament', 'player')

    def __str__(self):
        return f"{self.player.name} in {self.tournament.name}"


# ═══════════════════════════════════════════════════════════
#  STAFF
#  Club staff members shown on Club page.
#  Standalone — no relationships needed.
# ═══════════════════════════════════════════════════════════
class Staff(models.Model):
    name         = models.CharField(max_length=100)
    initials     = models.CharField(max_length=3)
    role         = models.CharField(max_length=100)
    joined_date  = models.CharField(max_length=20)
    bio          = models.TextField()
    badge_cls    = models.CharField(max_length=50,  blank=True)
    avatar_style = models.CharField(max_length=200, blank=True)

    def __str__(self):
        return self.name


# ═══════════════════════════════════════════════════════════
#  PARTNER
#  Friendly partner clubs shown on Tournaments page.
#  Standalone — no relationships needed.
# ═══════════════════════════════════════════════════════════
class Partner(models.Model):
    name      = models.CharField(max_length=100)
    initials  = models.CharField(max_length=5)
    last_met  = models.DateField()
    badge_bg  = models.CharField(max_length=200, blank=True)

    def __str__(self):
        return self.name
    


class ClubAsset(models.Model):
    """
    Dynamic club assets shown on the Club page.
    Replaces the hardcoded ASSETS list in Club.jsx.
    """
    icon  = models.CharField(max_length=10)   # emoji e.g. ⚽
    count = models.IntegerField(default=0)
    label = models.CharField(max_length=100)  # e.g. Match Balls
    order = models.IntegerField(default=0)    # display order
 
    class Meta:
        ordering = ['order', 'id']
 
    def __str__(self):
        return f"{self.icon} {self.label} ({self.count})"
 


from django.contrib.auth.hashers import make_password, check_password

class PortalUser(models.Model):
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    full_name = models.CharField(max_length=120, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def set_password(self, raw_password):
        self.password = make_password(raw_password)

    def check_password(self, raw_password):
        return check_password(raw_password, self.password)

    def __str__(self):
        return self.email