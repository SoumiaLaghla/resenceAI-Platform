from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Community, Post, Comment, FavoritePost
import pandas as pd
import numpy as np

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "password"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user
    
    def update(self, instance, validated_data):
        # Récupère et supprime le mot de passe des données validées si présent
        password = validated_data.pop('password', None)
        
        # Met à jour le reste des champs (ex : username)
        instance = super().update(instance, validated_data)

        # Si le mot de passe est fourni, on le hache et on l'enregistre
        if password:
            instance.set_password(password)
            instance.save()

        return instance

class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    post = serializers.PrimaryKeyRelatedField(read_only=True)
    
    class Meta:
        model = Comment
        fields = ['id', 'post', 'author', 'content', 'created_at']

class PostSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    community_name = serializers.CharField(source='community.name', read_only=True)  # Ajout du nom de la communauté
    likes = UserSerializer(many=True, read_only=True)
    likes_count = serializers.SerializerMethodField()
    comments = CommentSerializer(many=True, read_only=True)

    class Meta:
        model = Post
        fields = ['id', 'title', 'description', 'file', 'author', 'community_name', 'created_at', 'likes', 'likes_count', 'comments']
        read_only_fields = ['id', 'author', 'community', 'created_at']

    def get_likes_count(self, obj):
        return obj.likes.count()

    def create(self, validated_data):
        return Post.objects.create(**validated_data)

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if 'data_field' in representation:
            representation['data_field'] = self.clean_data(representation['data_field'])
        return representation

    def clean_data(self, data):
        """ Replace NaN and inf values in the data """
        if isinstance(data, list):
            df = pd.DataFrame(data)
            df.replace([np.inf, -np.inf], np.nan, inplace=True)
            df.fillna(0, inplace=True)
            return df.to_dict(orient='records')
        return data

class CommunitySerializer(serializers.ModelSerializer):
    admin = UserSerializer(read_only=True)
    members = UserSerializer(many=True, read_only=True)
    posts = PostSerializer(many=True, read_only=True)  # Ajoutez les posts à la communauté

    class Meta:
        model = Community
        fields = ['id', 'name', 'description', 'admin', 'members', 'posts', 'created_at']

class FavoritePostSerializer(serializers.ModelSerializer):
    post = PostSerializer(read_only=True)

    class Meta:
        model = FavoritePost
        fields = ['id', 'user', 'post', 'created_at']
