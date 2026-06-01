"""
products/views.py

API views for browsing categories and products.
"""

from rest_framework import generics, permissions, filters
from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer, ProductCreateSerializer


class CategoryListView(generics.ListCreateAPIView):
    """
    GET  /api/products/categories/  — list all categories (public)
    POST /api/products/categories/  — create a category (admin only in real app)
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class ProductListView(generics.ListCreateAPIView):
    """
    GET  /api/products/            — list all available products (public)
    POST /api/products/            — create a product (sellers only)

    Supports ?search=keyword and ?category=<id> query params.
    """
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description', 'seller__username']

    def get_queryset(self):
        queryset = Product.objects.filter(status='available')

        # Allow filtering by category: /api/products/?category=1
        category_id = self.request.query_params.get('category')
        if category_id:
            queryset = queryset.filter(category__id=category_id)

        return queryset

    def get_serializer_class(self):
        # Use the create serializer for POST, read serializer for GET
        if self.request.method == 'POST':
            return ProductCreateSerializer
        return ProductSerializer

    def perform_create(self, serializer):
        # Automatically set the seller to the currently logged-in user
        serializer.save(seller=self.request.user)


class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/products/<id>/  — view product details (public)
    PUT    /api/products/<id>/  — update product (owner only)
    PATCH  /api/products/<id>/  — partial update (owner only)
    DELETE /api/products/<id>/  — delete product (owner only)
    """
    queryset = Product.objects.all()

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return ProductCreateSerializer
        return ProductSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]


class MyProductsView(generics.ListAPIView):
    """
    GET /api/products/mine/
    Returns all products listed by the currently logged-in seller.
    """
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Product.objects.filter(seller=self.request.user)
