from django.urls import path
from . import views

urlpatterns = [
    path('home/',                     views.home_data,          name='home-data'),
    path('daily/',                    views.daily_data,         name='daily-latest'),
    path('daily/<str:date>/',         views.daily_data,         name='daily-by-date'),
    path('matches/',                  views.matches_list,       name='matches-list'),
    path('players/',                  views.players_list,       name='players-list'),
    path('players/<int:pk>/',         views.player_profile,     name='player-profile'),
    path('honours/',                  views.honours_board,      name='honours-board'),
    path('snapshot/',                 views.season_snapshot,    name='season-snapshot'),
    path('tournaments/',              views.tournaments_list,   name='tournaments-list'),
    path('tournaments/<int:pk>/',     views.tournament_detail,  name='tournament-detail'),
    path('club/',                     views.club_data,          name='club-data'),
]