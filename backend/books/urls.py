from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # Auth
    path('auth/register/', views.RegisterView.as_view(), name='register'),
    path('auth/login/', views.custom_login, name='login'),
    path('auth/user/', views.UserUpdateView.as_view(), name='user-update'),
    path('users/', views.UserListView.as_view(), name='user-list'),
    path('users/<int:pk>/', views.UserDetailView.as_view(), name='user-detail'),
    path('user-stats/', views.user_stats, name='user-stats'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Categories
    path('categories/', views.CategoryListView.as_view(), name='category-list'),
    
    # Books
    path('books/', views.BookListCreateView.as_view(), name='book-list-create'),
    path('books/<int:pk>/', views.BookDetailView.as_view(), name='book-detail'),
    path('my-books/', views.MyBooksView.as_view(), name='my-books'),
    
    # Exchanges
    path('exchanges/', views.ExchangeRequestListCreateView.as_view(), name='exchange-list-create'),
    path('exchanges/<int:pk>/', views.ExchangeRequestDetailView.as_view(), name='exchange-detail'),
    path('received-requests/', views.ReceivedRequestsView.as_view(), name='received-requests'),
    path('send-otp/', views.send_otp, name='send-otp'),
    path('verify-otp/', views.verify_otp, name='verify-otp'),
    
    # Reviews
    path('reviews/', views.ReviewListCreateView.as_view(), name='review-list-create'),
    
    # Notifications
    path('notifications/', views.NotificationListView.as_view(), name='notification-list'),
    path('notifications/<int:pk>/', views.NotificationUpdateView.as_view(), name='notification-update'),
]
