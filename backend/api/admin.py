from django.contrib import admin
from .models import (
    Player, Match, Goal, MatchAppearance,
    DailyEntry, Tournament, TournamentSquad,
    Staff, Partner
)

admin.site.register(Player)
admin.site.register(Match)
admin.site.register(Goal)
admin.site.register(MatchAppearance)
admin.site.register(DailyEntry)
admin.site.register(Tournament)
admin.site.register(TournamentSquad)
admin.site.register(Staff)
admin.site.register(Partner)