from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics, permissions
from .serializers import UserSerializer, CommunitySerializer, PostSerializer 
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.exceptions import PermissionDenied
from .models import Post, Community
from rest_framework.response import Response
from rest_framework import status
import pandas as pd
from rest_framework.views import APIView
from django.core.files.storage import default_storage
import numpy as np
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import render
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework import status
import pandas as pd
from django.core.files.storage import default_storage
from .models import Post
from .serializers import PostSerializer
from django.shortcuts import render
from rest_framework import generics, permissions
from .models import Post, Community
from .serializers import PostSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import pandas as pd
from django.core.files.storage import default_storage
from .models import Post
import pandas as pd
import numpy as np
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from django.core.files.storage import default_storage
from .models import Post
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import IsAuthenticated
from .models import Post, Comment, FavoritePost
from .serializers import PostSerializer, CommentSerializer, FavoritePostSerializer

class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

class UserDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user
    
class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated] 

class UserJoinedCommunitiesView(generics.ListAPIView):
    serializer_class = CommunitySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return user.joined_communities.all()  # Communautés auxquelles l'utilisateur a adhéré


class CommunityCreateList(generics.ListCreateAPIView):
    
    serializer_class = CommunitySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Community.objects.all()

    def perform_create(self, serializer):
        if serializer.is_valid():
            community=serializer.save(admin=self.request.user)
            community.members.add(self.request.user)
        else:
            print(serializer.errors)
        return super().perform_create(serializer)



class CommunityDeleteView(generics.DestroyAPIView):
    
    serializer_class = CommunitySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user= self.request.user
        return Community.objects.filter(admin=user)



class LeaveCommunityView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CommunitySerializer

    def delete(self, request, pk):
        try:
            print(f"Attempting to delete community with id: {pk}")
            community = Community.objects.get(pk=pk)

            if request.user in community.members.all():
                print(f"User {request.user} is a member. Removing...")
                community.members.remove(request.user)
                # Save the updated community instance
                community.save()
                return Response({"message": "You have successfully left the community."}, status=status.HTTP_204_NO_CONTENT)
            else:
                print("User is not a member.")
                return Response({"error": "You are not a member of this community."}, status=status.HTTP_400_BAD_REQUEST)
        
        except Community.DoesNotExist:
            print("Community not found.")
            return Response({"error": "Community not found."}, status=status.HTTP_404_NOT_FOUND)
class JoinCommunityView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CommunitySerializer

    def post(self, request, pk):
        try:
            community = Community.objects.get(pk=pk)
            if request.user not in community.members.all():
                community.members.add(request.user)
                community.save()
                return Response({"message": "You have successfully joined the community."}, status=status.HTTP_200_OK)
            else:
                return Response({"error": "You are already a member of this community."}, status=status.HTTP_400_BAD_REQUEST)
        
        except Community.DoesNotExist:
            return Response({"error": "Community not found."}, status=status.HTTP_404_NOT_FOUND)



class AllPostsView(generics.ListAPIView):
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Récupère l'utilisateur connecté
        user = self.request.user
        
        # Filtrer les posts par les communautés que l'utilisateur a rejoint
        joined_communities = user.joined_communities.all()  # Suppose que l'utilisateur a une relation avec les communautés qu'il a rejoint
        return Post.objects.filter(community__in=joined_communities).order_by('-created_at')


class PostDeleteView(generics.DestroyAPIView):
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        print(self.kwargs)
        return Post.objects.filter(id=self.kwargs['pk'])



class PostListCreateView(generics.ListCreateAPIView):
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        community_id = self.kwargs['community_id']
        return Post.objects.filter(community_id=community_id).order_by('-created_at')

    def perform_create(self, serializer):
        community = Community.objects.get(pk=self.kwargs['community_id'])
        
        # Vérifiez si l'utilisateur est un membre de la communauté
        if not community.members.filter(id=self.request.user.id).exists():
            raise PermissionDenied("You are not a member of this community.")

        serializer.save(author=self.request.user, community=community)

from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied
from .models import Post
from .serializers import PostSerializer

class PostUpdateView(generics.UpdateAPIView):
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Retourne uniquement les posts créés par l'utilisateur connecté
        return Post.objects.filter(id=self.kwargs['pk'] )


class PostDataView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            post = Post.objects.get(pk=pk)
        except Post.DoesNotExist:
            return Response({"error": "Post not found."}, status=status.HTTP_404_NOT_FOUND)
        
        if post.file:
            file_path = default_storage.path(post.file.name)
            try:
                # Lire le fichier CSV avec pandas
                df = pd.read_csv(file_path)
                # Convertir les données en JSON
                data_json = df.to_dict(orient='records')
                return Response(data_json, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({"error": "No file attached to this post."}, status=status.HTTP_400_BAD_REQUEST)



import pandas as pd
import numpy as np
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Post
from django.core.files.storage import default_storage

class PostVisualisationView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            post = Post.objects.get(pk=pk)
        except Post.DoesNotExist:
            return Response({"error": "Post not found."}, status=status.HTTP_404_NOT_FOUND)
        
        if post.file:
            file_path = default_storage.path(post.file.name)
            try:
                df = pd.read_csv(file_path)
                
                # Replace infinite values with NaN
                df.replace([np.inf, -np.inf], np.nan, inplace=True)
                
                # Fill NaN values with a default value or remove them
                df.fillna(0, inplace=True)  
                
                # Ensure that numeric values are clean
                for col in df.select_dtypes(include=[np.number]).columns:
                    df[col].replace([np.inf, -np.inf], np.nan, inplace=True)

                # Getting numeric and non-numeric columns
                numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
                non_numeric_cols = df.select_dtypes(exclude=[np.number]).columns.tolist()
                
                numeric_data = {}
                for col in numeric_cols:
                    sorted_values = df[col].tolist() 
                    numeric_data[col] = sorted_values

                # Send non-numeric columns as they are
                non_numeric_data = df[non_numeric_cols].to_dict(orient='list') if non_numeric_cols else {}

                response_data = {
                    "numeric_data": numeric_data,
                    "non_numeric_data": non_numeric_data  # Changed from non_numeric_summary
                }

                return Response(response_data, status=status.HTTP_200_OK)

            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({"error": "No file attached to this post."}, status=status.HTTP_400_BAD_REQUEST)

class LikePostView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, post_id):
        post = Post.objects.get(id=post_id)
        user = request.user
        if post.likes.filter(id=user.id).exists():
            post.likes.remove(user)
            message = "Post unliked"
        else:
            post.likes.add(user)
            message = "Post liked"
        return Response({'message': message}, status=status.HTTP_200_OK)

class CommentPostView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, post_id):
        post = Post.objects.get(id=post_id)
        author = request.user
        content = request.data.get('content')

        comment = Comment.objects.create(post=post, author=author, content=content)
        serializer = CommentSerializer(comment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
class CommentDeleteView(generics.DestroyAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        print(self.kwargs)
        return Comment.objects.filter(id=self.kwargs['pk'])


class CommentUpdateView(generics.UpdateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Retourne uniquement les posts créés par l'utilisateur connecté
        return Comment.objects.filter(id=self.kwargs['pk'] )

    def perform_update(self, serializer):
        # Vérifie que l'utilisateur est bien l'auteur du post
        comment = self.get_object()
        if comment.author != self.request.user:
            raise PermissionDenied("You do not have permission to update this comment.")
        
        # Effectue la mise à jour du post
        serializer.save()



class FavoritePostView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, post_id):
        post = Post.objects.get(id=post_id)
        user = request.user

        if FavoritePost.objects.filter(user=user, post=post).exists():
            FavoritePost.objects.filter(user=user, post=post).delete()
            return Response({'message': 'Post removed from favorites'}, status=status.HTTP_200_OK)
        else:
            FavoritePost.objects.create(user=user, post=post)
            return Response({'message': 'Post added to favorites'}, status=status.HTTP_201_CREATED)

class ListFavoritesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        favorites = FavoritePost.objects.filter(user=user)
        serializer = FavoritePostSerializer(favorites, many=True)
        return Response(serializer.data)
class CommentListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, post_id):
        try:
            post = Post.objects.get(id=post_id)
        except Post.DoesNotExist:
            return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)

        comments = Comment.objects.filter(post=post)
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class PostLikeStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, post_id):
        post = Post.objects.get(id=post_id)
        user = request.user
        is_liked = post.likes.filter(id=user.id).exists()
        return Response({'is_liked': is_liked})


from django.db.models import Q
from sklearn.metrics.pairwise import cosine_similarity
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q
from .models import Post, FavoritePost
from .serializers import PostSerializer
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
class PostRecommendationView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # 1. Récupérer les likes et les favoris
        likes_data = Post.objects.prefetch_related('likes').values('id', 'likes')
        favorites_data = FavoritePost.objects.values('post_id', 'user_id')

        # 2. Fusionner les données de likes et de favoris
        all_interactions = pd.DataFrame(list(likes_data))
        fav_df = pd.DataFrame(list(favorites_data))
        all_interactions = pd.concat([all_interactions, fav_df.rename(columns={'post_id': 'id', 'user_id': 'likes'})], ignore_index=True)

        # 3. Créer une matrice utilisateur-post (likes et favoris)
        user_post_matrix = all_interactions.pivot_table(index='likes', columns='id', aggfunc='size', fill_value=0)

        # 4. Calculer la similarité entre utilisateurs
        if user_post_matrix.empty:
            return Response({'detail': 'No recommendations available due to insufficient data'}, status=400)

        user_similarity = cosine_similarity(user_post_matrix)
        user_similarity_df = pd.DataFrame(user_similarity, index=user_post_matrix.index, columns=user_post_matrix.index)

        # Vérifiez que l'utilisateur est bien dans le DataFrame
        if user.id not in user_similarity_df.columns:
            return Response({'detail': 'No recommendations available for this user'}, status=400)

        # 5. Recommander des posts basés sur les utilisateurs similaires
        similar_users = user_similarity_df[user.id].sort_values(ascending=False)
        similar_users_posts = Post.objects.filter(
            Q(likes__in=similar_users.index) | Q(favorited_by__user__in=similar_users.index)
        ).exclude(Q(likes=user) | Q(favorited_by__user=user)).distinct().order_by('-created_at')

        # Limiter le nombre de recommandations
        recommended_posts = similar_users_posts[:10]

        # 6. Préparer la réponse avec le PostSerializer
        serializer = PostSerializer(recommended_posts, many=True)
        
        return Response({'recommended_posts': serializer.data})

from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404

class ManageCommunityMembersView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, community_id):
        """Ajouter un membre à la communauté"""
        community = get_object_or_404(Community, id=community_id)

        # Vérifiez si l'utilisateur est l'administrateur de la communauté
        if request.user != community.admin:
            return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

        # Récupérer les ID des membres à ajouter
        member_ids = request.data.get('member_ids', [])
        existing_members = community.members.values_list('id', flat=True)

        # Ajouter chaque membre
        for member_id in member_ids:
            try:
                user = User.objects.get(id=member_id)

                # Vérifiez si l'utilisateur est déjà membre
                if user.id in existing_members:
                    return Response({'detail': f'User with id {member_id} is already a member.'}, status=status.HTTP_400_BAD_REQUEST)

                # Ajoutez le membre
                community.members.add(user)
            except User.DoesNotExist:
                return Response({'detail': f'User with id {member_id} does not exist.'}, status=status.HTTP_404_NOT_FOUND)

        return Response({'detail': 'Members added successfully.'}, status=status.HTTP_200_OK)

    def delete(self, request, community_id):
        """Retirer un membre de la communauté"""
        community = get_object_or_404(Community, id=community_id)

        # Vérifiez si l'utilisateur est l'administrateur de la communauté
        if request.user != community.admin:
            return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

        # Récupérer les ID des membres à retirer
        member_ids = request.data.get('member_ids', [])

        # Retirer chaque membre
        for member_id in member_ids:
            try:
                user = User.objects.get(id=member_id)

                # Vérifiez si l'utilisateur est un membre de la communauté
                if user not in community.members.all():
                    return Response({'detail': f'User with id {member_id} is not a member of the community.'}, status=status.HTTP_400_BAD_REQUEST)

                # Retirez le membre
                community.members.remove(user)
            except User.DoesNotExist:
                return Response({'detail': f'User with id {member_id} does not exist.'}, status=status.HTTP_404_NOT_FOUND)

        return Response({'detail': 'Members removed successfully.'}, status=status.HTTP_200_OK)
class CommunityMembersView(generics.RetrieveAPIView):
    queryset = Community.objects.all()
    serializer_class = CommunitySerializer

    def get(self, request, *args, **kwargs):
        community = self.get_object()
        # Filter out the admin and superusers from the members list
        members = community.members.exclude(id=community.admin.id).exclude(is_superuser=True)
        members_data = [{'id': member.id, 'username': member.username} for member in members]
        return Response({'members': members_data})

    

class CommunityDetailView(generics.RetrieveAPIView):
    queryset = Community.objects.all()
    serializer_class = CommunitySerializer
    lookup_field = 'pk'