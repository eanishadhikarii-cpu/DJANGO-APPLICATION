from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User, Book, ExchangeRequest, Category, Review, Notification
from django.contrib.auth import authenticate

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']

class BookListSerializer(serializers.ModelSerializer):
    owner_username = serializers.CharField(source='owner.username', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = Book
        fields = ['id', 'title', 'author', 'category_name', 'condition', 'image', 'cover_image_url', 'city', 'owner_username', 'created_at']

class BookDetailSerializer(serializers.ModelSerializer):
    owner_username = serializers.CharField(source='owner.username', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = Book
        fields = '__all__'

class BookCreateSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=False)
    
    class Meta:
        model = Book
        fields = ['title', 'author', 'category', 'condition', 'image', 'cover_image_url', 'city']
    
    def validate_category(self, value):
        if not Category.objects.filter(id=value.id).exists():
            raise serializers.ValidationError("Category does not exist.")
        return value

    def validate_title(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Book title is required")
        return value

    def validate_author(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Book author is required")
        return value

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'city', 'profile_picture', 'role', 'password']
        extra_kwargs = {
            'password': {'write_only': True},
            # Prevent normal users from changing role via self-update endpoints.
            'role': {'read_only': True},
        }


    def create(self, validated_data):
        password = validated_data.pop('password', None)
        instance = self.Meta.model(**validated_data)
        if password is not None:
            instance.set_password(password)
        instance.save()
        return instance

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password is not None:
            instance.set_password(password)
        instance.save()
        return instance

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password2', 'city', 'role')
        extra_kwargs = {
            # Normal users shouldn't choose their role during registration.
            'role': {'read_only': True},
        }

    
    def validate(self, attrs):
        if attrs.get('password') != attrs.get('password2'):
            raise serializers.ValidationError("Password fields didn't match.")
        return attrs

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("This username is already taken.")
        return value

    def validate_email(self, value):
        import re
        if not re.match(r"[^@]+@[^@]+\.[^@]+", value):
            raise serializers.ValidationError("Invalid email format")
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_password(self, value):
        if len(value) < 6:
            raise serializers.ValidationError("Password must be at least 6 characters")
        return value
    
    def create(self, validated_data):
        validated_data.pop('password2')
        # Always create new accounts as normal users.
        validated_data['role'] = 'user'
        user = User.objects.create_user(**validated_data)
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

class ExchangeRequestSerializer(serializers.ModelSerializer):
    book_from_title = serializers.CharField(source='book_from.title', read_only=True)
    book_to_title = serializers.CharField(source='book_to.title', read_only=True)
    sender_username = serializers.CharField(source='sender.username', read_only=True)
    receiver_username = serializers.CharField(source='receiver.username', read_only=True)
    
    class Meta:
        model = ExchangeRequest
        fields = ['id', 'sender_username', 'receiver_username', 'book_from_title', 'book_to_title', 'status', 'message', 'created_at']
        read_only_fields = ['sender', 'receiver', 'book_from', 'book_to', 'status']

class ExchangeRequestCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExchangeRequest
        fields = ['book_to', 'message']
    
    def create(self, validated_data):
        validated_data['sender'] = self.context['request'].user
        validated_data['book_from'] = self.context['view'].book_from  # Set in view
        validated_data['receiver'] = validated_data['book_to'].owner
        return super().create(validated_data)

class ReviewSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    book_title = serializers.CharField(source='book.title', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'book', 'book_title', 'user', 'user_username', 'rating', 'comment', 'created_at']
        read_only_fields = ['user']

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'recipient', 'message', 'created_at', 'read']

