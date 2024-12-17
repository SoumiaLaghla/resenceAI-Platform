from django.contrib import admin
from .models import Community, Post, Comment, FavoritePost

# Enregistrement des modèles dans l'admin
admin.site.register(Community)
admin.site.register(Post)
admin.site.register(Comment)
admin.site.register(FavoritePost)
