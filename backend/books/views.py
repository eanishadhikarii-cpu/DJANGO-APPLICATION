from rest_framework import generics, status, permissions, filters
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes

import logging

from rest_framework_simplejwt.tokens import RefreshToken
from django.shortcuts import get_object_or_404
from django.contrib.auth import authenticate
from django_filters.rest_framework import DjangoFilterBackend
from django.db import models
from django.core.mail import send_mail
import random

from .models import Book, ExchangeRequest, Category, User, EmailOTP, Review, Notification
from .serializers import (
    RegisterSerializer, LoginSerializer, UserSerializer, 
    BookListSerializer, BookDetailSerializer, BookCreateSerializer,
    ExchangeRequestSerializer, ExchangeRequestCreateSerializer,
    CategorySerializer, ReviewSerializer, NotificationSerializer
)
from .permissions import IsAdminUser, CanManageStock

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

@api_view(['POST'])
@permission_classes([AllowAny])
def custom_login(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = authenticate(username=serializer.validated_data['username'], 
                          password=serializer.validated_data['password'])
        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': UserSerializer(user).data
            })
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)

# --- Book Views ---

class BookListCreateView(generics.ListCreateAPIView):
    queryset = Book.objects.all().order_by('-created_at')
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['category', 'city', 'condition']
    search_fields = ['title', 'author']

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return BookCreateSerializer
        return BookListSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [CanManageStock()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class BookDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Book.objects.all()
    serializer_class = BookDetailSerializer

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [CanManageStock()]
        return [permissions.AllowAny()]

class MyBooksView(generics.ListAPIView):
    serializer_class = BookListSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Book.objects.filter(owner=self.request.user).select_related('owner', 'category')

# --- User Views ---

class UserListView(generics.ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return RegisterSerializer
        return UserSerializer

class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]

class UserUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user

    def patch(self, request, *args, **kwargs):
        response = super().patch(request, *args, **kwargs)
        return Response({
            'success': True,
            'data': response.data,
            'message': 'Profile updated successfully'
        })

# --- Exchange Views ---

class ExchangeRequestListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return ExchangeRequest.objects.filter(sender=self.request.user).select_related('sender', 'receiver', 'book_from', 'book_to')
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ExchangeRequestCreateSerializer
        return ExchangeRequestSerializer
    
    def perform_create(self, serializer):
        book_from_id = self.request.data.get('book_from_id')
        book_from = get_object_or_404(Book, pk=book_from_id, owner=self.request.user)
        self.book_from = book_from
        serializer.save()

class ReceivedRequestsView(generics.ListAPIView):
    serializer_class = ExchangeRequestSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return ExchangeRequest.objects.filter(receiver=self.request.user).select_related('sender', 'receiver', 'book_from', 'book_to')

class ExchangeRequestDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = ExchangeRequestSerializer
    permission_classes = [IsAuthenticated]
    lookup_url_kwarg = 'pk'
    
    def get_queryset(self):
        return ExchangeRequest.objects.filter(
            models.Q(sender=self.request.user) | models.Q(receiver=self.request.user)
        ).select_related('sender', 'receiver', 'book_from', 'book_to')
    
    def patch(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.receiver != request.user:
            return Response({'error': 'Not authorized'}, status=403)
        new_status = request.data.get('status')
        if new_status in ['accepted', 'rejected']:
            instance.status = new_status
            instance.save()
            return Response(self.get_serializer(instance).data)
        return Response({'error': 'Invalid status'}, status=400)

# --- Stats & Helpers ---

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_stats(request):
    user = request.user
    stats = {
        'books_owned': Book.objects.filter(owner=user).count(),
        'exchanges_total': ExchangeRequest.objects.filter(
            models.Q(sender=user) | models.Q(receiver=user),
            status='accepted'
        ).count(),
        'points': 100,
        'community_users': User.objects.count()
    }
    return Response({'success': True, 'data': stats})

class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]

# --- OTP System ---

@api_view(['POST'])
@permission_classes([AllowAny])
def send_otp(request):
    email = request.data.get('email')
    if not email: return Response({'error': 'Email is required'}, status=400)
    otp = str(random.randint(100000, 999999))
    EmailOTP.objects.create(email=email, otp=otp)
    logger = logging.getLogger(__name__)


    try:
        send_mail('BookExchange OTP', f'Your code is: {otp}', 'noreply@bookexchange.com', [email])
        return Response({'message': 'OTP sent successfully'})
    except Exception as e:
        logger.exception("Failed to send OTP email")
        return Response({'error': 'Failed to send email'}, status=500)

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp(request):
    email = request.data.get('email')
    otp = request.data.get('otp')
    if not email or not otp: return Response({'error': 'Email and OTP required'}, status=400)
    record = EmailOTP.objects.filter(email=email, otp=otp, is_verified=False).last()
    if not record or record.is_expired(): return Response({'error': 'Invalid or expired OTP'}, status=400)
    record.is_verified = True
    record.save()
    user = User.objects.filter(email=email).first()
    if user:
        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data
        })
    return Response({'message': 'OTP verified'})

# --- Review Views ---

class ReviewListCreateView(generics.ListCreateAPIView):
    queryset = Review.objects.all().order_by('-created_at')
    serializer_class = ReviewSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['book']

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

# --- Notification Views ---

class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user).order_by('-created_at')

class NotificationUpdateView(generics.UpdateAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user)
