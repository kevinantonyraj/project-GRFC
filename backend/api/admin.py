from django.contrib import admin
from .models import (
    Team, Player, Match, Goal, MatchAppearance,
    DailyEntry, Tournament, TournamentTeam,
    TournamentSquad, Staff, Partner
)


@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display  = ['name', 'short_code', 'is_golden_rock']
    list_filter   = ['is_golden_rock']
    search_fields = ['name']


@admin.register(Player)
class PlayerAdmin(admin.ModelAdmin):
    list_display  = ['name', 'position', 'number', 'current_team', 'is_active']
    list_filter   = ['position', 'is_active', 'is_featured']
    search_fields = ['name', 'nickname']


@admin.register(Match)
class MatchAdmin(admin.ModelAdmin):
    list_display  = ['__str__', 'date', 'competition', 'result', 'match_type']
    list_filter   = ['result', 'match_type', 'competition']
    search_fields = ['home_team__name', 'away_team__name', 'competition']
    ordering      = ['-date']


@admin.register(Goal)
class GoalAdmin(admin.ModelAdmin):
    list_display  = ['player', 'team', 'match', 'minute', 'is_own_goal']
    list_filter   = ['is_own_goal', 'team']
    search_fields = ['player__name']


@admin.register(MatchAppearance)
class MatchAppearanceAdmin(admin.ModelAdmin):
    list_display  = ['player', 'team', 'match', 'rating', 'assists', 'is_motm', 'is_substitute']
    list_filter   = ['is_motm', 'is_substitute', 'team']
    search_fields = ['player__name']


@admin.register(DailyEntry)
class DailyEntryAdmin(admin.ModelAdmin):
    list_display  = ['date', 'competition', 'motm_player']
    search_fields = ['competition', 'motm_player__name']
    ordering      = ['-date']


@admin.register(Tournament)
class TournamentAdmin(admin.ModelAdmin):
    list_display  = ['name', 'year', 'result', 'venue']
    list_filter   = ['result', 'year']
    search_fields = ['name', 'venue']


@admin.register(TournamentTeam)
class TournamentTeamAdmin(admin.ModelAdmin):
    list_display  = ['tournament', 'team', 'final_position']


@admin.register(TournamentSquad)
class TournamentSquadAdmin(admin.ModelAdmin):
    list_display  = ['tournament', 'player']
    search_fields = ['player__name', 'tournament__name']


@admin.register(Staff)
class StaffAdmin(admin.ModelAdmin):
    list_display  = ['name', 'role', 'joined_date']
    search_fields = ['name', 'role']


@admin.register(Partner)
class PartnerAdmin(admin.ModelAdmin):
    list_display  = ['name', 'initials', 'last_met']
    ordering      = ['-last_met']