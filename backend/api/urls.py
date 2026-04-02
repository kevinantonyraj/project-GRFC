from django.urls import path
from . import views

urlpatterns = [

    # ── Home ───────────────────────────────────────────────
    # GET /api/home/
    path('home/', views.home_data, name='home-data'),

    # ── Daily ──────────────────────────────────────────────
    # GET /api/daily/              → most recent entry
    # GET /api/daily/2023-11-04/   → specific date
    path('daily/',          views.daily_data, name='daily-latest'),
    path('daily/<str:date>/', views.daily_data, name='daily-by-date'),

    # ── Matches ────────────────────────────────────────────
    # GET /api/matches/            → all matches
    # GET /api/matches/?result=win → filtered by result
    path('matches/', views.matches_list, name='matches-list'),

    # ── Players ────────────────────────────────────────────
    # GET /api/players/            → all active players
    # GET /api/players/1/          → single player profile
    path('players/',      views.players_list,  name='players-list'),
    path('players/<int:pk>/', views.player_profile, name='player-profile'),

    # ── Honours Board ──────────────────────────────────────
    # GET /api/honours/            → top scorers, assists, motm
    path('honours/', views.honours_board, name='honours-board'),

    # ── Season Snapshot ────────────────────────────────────
    # GET /api/snapshot/           → win rate, goals, clean sheets
    path('snapshot/', views.season_snapshot, name='season-snapshot'),

    # ── Tournaments ────────────────────────────────────────
    # GET /api/tournaments/              → all tournaments
    # GET /api/tournaments/?result=champions → filtered
    path('tournaments/', views.tournaments_list, name='tournaments-list'),

    # ── Club ───────────────────────────────────────────────
    # GET /api/club/               → staff + partners
    path('club/', views.club_data, name='club-data'),
]