from django.db import models


class Team(models.Model):
    name           = models.CharField(max_length=100)
    short_code     = models.CharField(max_length=5)        # GR, RS, IW
    badge_bg       = models.CharField(max_length=200, blank=True)
    is_golden_rock = models.BooleanField(default=False)    # True = internal squad

    def __str__(self):
        return self.name


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

    current_team = models.ForeignKey(
        Team,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='current_players'
    )

    def __str__(self):
        return self.name


class Match(models.Model):
    RESULT_CHOICES = [
        ('win',  'Win'),
        ('draw', 'Draw'),
        ('loss', 'Loss'),
    ]

    MATCH_TYPE_CHOICES = [
        ('internal',    'Internal'),     
        ('external',    'External'),     
        ('friendly',    'Friendly'),     
        ('tournament',  'Tournament'),   
    ]

    date        = models.DateTimeField()
    competition = models.CharField(max_length=100)
    venue       = models.CharField(max_length=100)

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


class Goal(models.Model):
    match       = models.ForeignKey(Match,  on_delete=models.CASCADE, related_name='goals')
    player      = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='goals')
    team        = models.ForeignKey(Team,   on_delete=models.CASCADE, related_name='goals')
    minute      = models.IntegerField()
    is_own_goal = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.player.name} {self.minute}' ({self.team.name})"


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

    teams  = models.ManyToManyField(Team,   through='TournamentTeam',  blank=True)
    squad  = models.ManyToManyField(Player, through='TournamentSquad', blank=True)

    def __str__(self):
        return f"{self.name} ({self.year})"


class TournamentTeam(models.Model):
    tournament     = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name='tournament_teams')
    team           = models.ForeignKey(Team,       on_delete=models.CASCADE, related_name='tournament_teams')
    final_position = models.IntegerField(null=True, blank=True)

    class Meta:
        unique_together = ('tournament', 'team')

    def __str__(self):
        return f"{self.team.name} in {self.tournament.name}"


class TournamentSquad(models.Model):
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name='tournament_squads')
    player     = models.ForeignKey(Player,     on_delete=models.CASCADE, related_name='tournament_squads')

    class Meta:
        unique_together = ('tournament', 'player')

    def __str__(self):
        return f"{self.player.name} in {self.tournament.name}"


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
    icon  = models.CharField(max_length=10)   
    count = models.IntegerField(default=0)
    label = models.CharField(max_length=100)  
    order = models.IntegerField(default=0)    
 
    class Meta:
        ordering = ['order', 'id']
 
    def __str__(self):
        return f"{self.icon} {self.label} ({self.count})"
 