from rest_framework import serializers
from .models import (
    ClubAsset, Team, Player, Match, Goal, MatchAppearance,
    DailyEntry, Tournament, TournamentTeam,
    TournamentSquad, Staff, Partner
)

class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Team
        fields = '__all__'


class PlayerSerializer(serializers.ModelSerializer):
    current_team = TeamSerializer(read_only=True)
    total_appearances = serializers.IntegerField(read_only=True)
    total_goals       = serializers.IntegerField(read_only=True)
    total_assists     = serializers.IntegerField(read_only=True)

    class Meta:
        model  = Player
        fields = '__all__'


class PlayerStatsSerializer(serializers.ModelSerializer):
    total_goals   = serializers.IntegerField(read_only=True)
    total_assists = serializers.IntegerField(read_only=True)
    total_motm    = serializers.IntegerField(read_only=True)

    class Meta:
        model  = Player
        fields = [
            'id', 'name', 'nickname', 'initials',
            'position', 'number', 'avatar_bg',
            'total_goals', 'total_assists', 'total_motm',
        ]


class GoalSerializer(serializers.ModelSerializer):
    player_name = serializers.CharField(source='player.name', read_only=True)
    team_name   = serializers.CharField(source='team.name',   read_only=True)

    class Meta:
        model  = Goal
        fields = [
            'id', 'match', 'minute',
            'is_own_goal', 'player_name', 'team_name',
        ]


class MatchAppearanceSerializer(serializers.ModelSerializer):
    player_name   = serializers.CharField(source='player.name',     read_only=True)
    player_initials = serializers.CharField(source='player.initials', read_only=True)
    player_position = serializers.CharField(source='player.position', read_only=True)
    team_name     = serializers.CharField(source='team.name',       read_only=True)

    class Meta:
        model  = MatchAppearance
        fields = [
            'id', 'match', 'player_name', 'player_initials',
            'player_position', 'team_name',
            'rating', 'assists', 'is_motm', 'is_substitute',
        ]


class MatchSerializer(serializers.ModelSerializer):
    home_team_name  = serializers.CharField(source='home_team.name',       read_only=True)
    home_team_code  = serializers.CharField(source='home_team.short_code', read_only=True)
    home_team_badge = serializers.CharField(source='home_team.badge_bg',   read_only=True)
    away_team_name  = serializers.CharField(source='away_team.name',       read_only=True)
    away_team_code  = serializers.CharField(source='away_team.short_code', read_only=True)
    away_team_badge = serializers.CharField(source='away_team.badge_bg',   read_only=True)
    goals           = GoalSerializer(many=True, read_only=True)
    appearances     = MatchAppearanceSerializer(many=True, read_only=True)

    class Meta:
        model  = Match
        fields = [
            'id', 'date', 'competition', 'venue',
            'home_team_name', 'home_team_code', 'home_team_badge',
            'away_team_name', 'away_team_code', 'away_team_badge',
            'home_score', 'away_score', 'result', 'match_type', 'notes',
            'goals', 'appearances',
        ]


class DailyEntrySerializer(serializers.ModelSerializer):
    match       = MatchSerializer(read_only=True)
    motm_player = PlayerSerializer(read_only=True)

    class Meta:
        model  = DailyEntry
        fields = [
            'id', 'date', 'competition', 'notes',
            'match', 'motm_player',
            'motm_goals', 'motm_assists', 'motm_rating',
        ]


class TournamentSquadSerializer(serializers.ModelSerializer):
    player_name     = serializers.CharField(source='player.name',     read_only=True)
    player_initials = serializers.CharField(source='player.initials', read_only=True)

    class Meta:
        model  = TournamentSquad
        fields = ['id', 'player_name', 'player_initials']


class TournamentTeamSerializer(serializers.ModelSerializer):
    team_name  = serializers.CharField(source='team.name',       read_only=True)
    team_code  = serializers.CharField(source='team.short_code', read_only=True)
    team_badge = serializers.CharField(source='team.badge_bg',   read_only=True)

    class Meta:
        model  = TournamentTeam
        fields = ['id', 'team_name', 'team_code', 'team_badge', 'final_position']


class TournamentSerializer(serializers.ModelSerializer):
    tournament_squads = TournamentSquadSerializer(many=True, read_only=True)
    tournament_teams  = TournamentTeamSerializer(many=True,  read_only=True)

    class Meta:
        model  = Tournament
        fields = [
            'id', 'name', 'result', 'dates', 'venue', 'year',
            'total_teams', 'total_matches', 'total_goals',
            'tournament_squads', 'tournament_teams',
        ]


class StaffSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Staff
        fields = '__all__'


class PartnerSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Partner
        fields = '__all__'


class ClubAssetSerializer(serializers.ModelSerializer):
    class Meta:
         model = ClubAsset
         fields = '__all__'