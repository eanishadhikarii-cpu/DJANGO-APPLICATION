from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Book, ExchangeRequest, Category, Review, Notification

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'role', 'city', 'is_staff')
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Role & Profile', {'fields': ('role', 'city', 'profile_picture')}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Role & Profile', {'fields': ('role', 'city', 'profile_picture')}),
    )

@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'author', 'owner', 'condition', 'cover_image_url', 'created_at']
    list_filter = ['category', 'condition', 'city', 'created_at']
    search_fields = ['title', 'author', 'owner__username']
    readonly_fields = ['created_at']

@admin.register(ExchangeRequest)
class ExchangeRequestAdmin(admin.ModelAdmin):
    list_display = ['id', 'sender', 'receiver', 'book_from', 'book_to', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['sender__username', 'receiver__username', 'book_from__title', 'book_to__title']

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['id', 'name']

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['id', 'book', 'user', 'rating', 'created_at']
    list_filter = ['rating', 'created_at']
    search_fields = ['book__title', 'user__username', 'comment']

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['id', 'recipient', 'message', 'read', 'created_at']
    list_filter = ['read', 'created_at']
    search_fields = ['recipient__username', 'message']
