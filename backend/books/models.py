from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import FileExtensionValidator
from django.utils import timezone
from datetime import timedelta

class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('librarian', 'Librarian'),
        ('user', 'Normal User'),
    )
    
    email = models.EmailField(unique=True)
    city = models.CharField(max_length=100, blank=True)
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='user')

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"

class EmailOTP(models.Model):
    email = models.EmailField()
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_verified = models.BooleanField(default=False)

    def is_expired(self):
        # OTP expires in 10 minutes
        return timezone.now() > self.created_at + timedelta(seconds=60)

    def __str__(self):
        return f"{self.email} - {self.otp}"

class Category(models.Model):
    name = models.CharField(max_length=50)
    
    def __str__(self):
        return self.name

class Condition(models.TextChoices):
    NEW = 'new', 'New'
    LIKE_NEW = 'like_new', 'Like New'
    GOOD = 'good', 'Good'
    FAIR = 'fair', 'Fair'
    POOR = 'poor', 'Poor'

class Book(models.Model):
    title = models.CharField(max_length=200)
    author = models.CharField(max_length=200)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    condition = models.CharField(max_length=20, choices=Condition.choices)
    image = models.ImageField(upload_to='book_covers/', blank=True, null=True)
    cover_image_url = models.URLField(max_length=500, blank=True, null=True)
    city = models.CharField(max_length=100)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='books')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.title} by {self.author}"

class ExchangeRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('completed', 'Completed'),
    ]
    
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_requests')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_requests')
    book_from = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='outgoing_requests')
    book_to = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='incoming_requests')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    message = models.TextField(blank=True)
    
    class Meta:
        unique_together = ['sender', 'book_from', 'book_to']
    
    def __str__(self):
        return f"{self.sender.username} -> {self.receiver.username} ({self.status})"
    
class Review(models.Model):
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    rating = models.PositiveSmallIntegerField()
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} review for {self.book.title}"

class Notification(models.Model):
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    message = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    read = models.BooleanField(default=False)

    def __str__(self):
        return f"Notification for {self.recipient.username}: {self.message}"

# Signal to create notifications for admin and librarian when a review is saved
from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=Review)
def create_review_notification(sender, instance, created, **kwargs):
    if created:
        # Notify all admins and librarians
        recipients = User.objects.filter(role__in=['admin', 'librarian'])
        for user in recipients:
            Notification.objects.create(
                recipient=user,
                message=f"{instance.user.username} posted a review for '{instance.book.title}'."
            )
                        