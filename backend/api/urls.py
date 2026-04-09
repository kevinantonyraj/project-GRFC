from django.urls import path
from . import views
from . import admin_views as av

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

    path('admin/bootstrap/',                 av.admin_bootstrap,          name='admin-bootstrap'),
    path('admin/teams/',                      av.team_list_create,         name='admin-teams'),
    path('admin/teams/<int:pk>/',             av.team_detail,              name='admin-team-detail'),
    path('admin/players/',                    av.player_list_create,       name='admin-players'),
    path('admin/players/<int:pk>/',           av.player_detail,            name='admin-player-detail'),
    path('admin/matches/',                    av.match_list_create,        name='admin-matches'),
    path('admin/matches/<int:pk>/',           av.match_detail,             name='admin-match-detail'),
    path('admin/goals/',                      av.goal_list_create,         name='admin-goals'),
    path('admin/goals/<int:pk>/',             av.goal_delete,              name='admin-goal-delete'),
    path('admin/appearances/',                av.appearance_list_create,   name='admin-appearances'),
    path('admin/appearances/<int:pk>/',       av.appearance_delete,        name='admin-appearance-delete'),
    path('admin/daily/',                      av.daily_entry_manage,       name='admin-daily'),
    path('admin/daily/<int:pk>/',             av.daily_entry_delete,       name='admin-daily-delete'),
    path('admin/tournaments/',                av.tournament_list_create,   name='admin-tournaments'),
    path('admin/tournaments/<int:pk>/',       av.tournament_detail_manage, name='admin-tournament-detail'),
    path('admin/tournament-squad/',           av.tournament_squad_manage,  name='admin-tournament-squad'),
    path('admin/tournament-team/',            av.tournament_team_manage,   name='admin-tournament-team'),
    path('admin/staff/',                      av.staff_list_create,        name='admin-staff'),
    path('admin/staff/<int:pk>/',             av.staff_detail,             name='admin-staff-detail'),
    path('admin/partners/',                   av.partner_list_create,      name='admin-partners'),
    path('admin/partners/<int:pk>/',          av.partner_detail,           name='admin-partner-detail'),
    path('admin/assets/', av.asset_list_create), path('admin/assets/<int:pk>/', av.asset_detail)
]
