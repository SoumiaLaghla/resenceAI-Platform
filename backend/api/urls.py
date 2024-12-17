from django.urls import path
from .views import CreateUserView, CommunityCreateList, CommunityDeleteView, LeaveCommunityView, PostListCreateView, PostDeleteView,  PostDataView, PostVisualisationView, LikePostView, CommentPostView, FavoritePostView, ListFavoritesView, CommentListView, PostLikeStatusView, AllPostsView, UserJoinedCommunitiesView,JoinCommunityView,UserDetailView, PostRecommendationView,PostUpdateView, CommentUpdateView, CommentDeleteView,ManageCommunityMembersView, CommunityMembersView, UserListView, CommunityDetailView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('users/', UserListView.as_view(), name='user_list'),
    path("user/register/", CreateUserView.as_view(), name="register"),
    path('user/', UserDetailView.as_view(), name='user-detail'),
    path("token/", TokenObtainPairView.as_view(), name="get_token"),
    path("token/refresh/", TokenRefreshView.as_view(), name="refresh"),
    path('communities/<int:pk>/', CommunityDetailView.as_view(), name='community-detail'),
    path("communities/", CommunityCreateList.as_view(), name="list_community"),
    path("communities/delete/<int:pk>", CommunityDeleteView.as_view(), name="delete_community"),
    path("communities/leave/<int:pk>/", LeaveCommunityView.as_view(), name="leave_community"),
    path("communities/join/<int:pk>/", JoinCommunityView.as_view(), name="join_community"),
    path('communities/manage_members/<int:community_id>/', ManageCommunityMembersView.as_view(), name='manage_community_members'),
    path('communities/members/<int:pk>/', CommunityMembersView.as_view(), name='community_members'),
    path('communities/<int:community_id>/posts/', PostListCreateView.as_view(), name='post-list-create'),
    path('posts/<int:pk>/delete/', PostDeleteView.as_view(), name='post-delete'),
    path('posts/<int:pk>/update/', PostUpdateView.as_view(), name='post-update'),
    path('posts/data/<int:pk>/', PostDataView.as_view(), name='post-data'),
    path('posts/dash/<int:pk>/', PostVisualisationView.as_view(), name='post-dash'),
    path('posts/<int:post_id>/like/', LikePostView.as_view(), name='like_post'),
    path('posts/<int:post_id>/comment/', CommentPostView.as_view(), name='comment_post'),
    path('posts/comment/delete/<int:pk>/', CommentDeleteView.as_view(), name='comment-delete'),
    path('posts/comment/update/<int:pk>/', CommentUpdateView.as_view(), name='comment-update'),
    path('posts/<int:post_id>/favorite/', FavoritePostView.as_view(), name='favorite_post'),
    path('favorites/', ListFavoritesView.as_view(), name='list_favorites'),
    path('posts/<int:post_id>/comments/', CommentListView.as_view(), name='post_comments'),
    path('posts/<int:post_id>/is_liked/', PostLikeStatusView.as_view(), name='is_liked_post'),
    path('posts/', AllPostsView.as_view(), name='all-posts'),
    path('user-communities/', UserJoinedCommunitiesView.as_view(), name='user-communities'),
    path('post-recommend/', PostRecommendationView.as_view(), name='post-recommendation'),
    
    ] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
