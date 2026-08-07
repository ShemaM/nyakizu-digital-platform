"""
products/views.py
"""

from django.utils.text import slugify
from rest_framework import generics, permissions, filters
from rest_framework.exceptions import PermissionDenied
from django.db.models import Q
from accounts.permissions import IsAdminOrReadOnly, is_admin_user, is_approved_seller
from .models import Category, Product
from .serializers import (
    CategorySerializer, ProductSerializer,
    BuyerProductSerializer, ProductCreateSerializer,
)


class CategoryListView(generics.ListCreateAPIView):
    queryset           = Category.objects.all()
    serializer_class   = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]

    def perform_create(self, serializer):
        name = serializer.validated_data.get("name", "")
        base_slug = slugify(name) or "category"
        slug = base_slug
        suffix = 2
        while Category.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{suffix}"
            suffix += 1
        serializer.save(slug=slug)


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset           = Category.objects.all()
    serializer_class   = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]


class ProductListView(generics.ListCreateAPIView):
    """
    GET  /api/products/  — public product list (uses BuyerProductSerializer)
    POST /api/products/  — seller creates product

    Query params:
      ?search=<keyword>
      ?category=<id>
      ?seller=<user_id>
    """
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends    = [filters.SearchFilter]
    search_fields      = ["name", "description", "seller__username"]

    def get_queryset(self):
        qs = Product.objects.select_related("category", "seller").filter(
            status="available",
            seller__seller_profile__approval_status="approved",
        )

        category_id = self.request.query_params.get("category")
        if category_id:
            qs = qs.filter(category__id=category_id)

        # `seller` here means the SellerProfile id — the identifier the
        # frontend already carries everywhere (storefront URLs, relationships,
        # etc). Product.seller is a FK straight to the CustomUser, so this
        # has to hop through the reverse seller_profile accessor rather than
        # matching seller__id directly.
        seller_id = self.request.query_params.get("seller")
        if seller_id:
            qs = qs.filter(seller__seller_profile__id=seller_id)

        return qs

    def get_serializer_class(self):
        if self.request.method == "POST":
            return ProductCreateSerializer
        # Public listing always uses buyer view (no stock_quantity)
        return BuyerProductSerializer

    def perform_create(self, serializer):
        if not is_approved_seller(self.request.user):
            raise PermissionDenied("Only approved sellers can create products.")
        serializer.save(seller=self.request.user)


class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    def get_queryset(self):
        user = self.request.user
        base = Product.objects.select_related("category", "seller")

        if is_admin_user(user):
            return base.all()

        if self.request.method == "GET":
            public_products = Q(
                status="available",
                seller__seller_profile__approval_status="approved",
            )
            if user.is_authenticated:
                public_products |= Q(seller=user)
            return base.filter(public_products)

        # Product edits are private to the seller who owns the listing.
        return base.filter(seller=user)

    def get_serializer_class(self):
        if self.request.method in ("PUT", "PATCH"):
            return ProductCreateSerializer
        # Owner sees full serializer; everyone else sees buyer serializer
        obj = self.get_object()
        if self.request.user == obj.seller:
            return ProductSerializer
        return BuyerProductSerializer

    def get_permissions(self):
        if self.request.method == "GET":
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]


class MyProductsView(generics.ListAPIView):
    """GET /api/products/mine/ — seller sees their own products (with stock_quantity)."""
    serializer_class   = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role != "seller" and not is_admin_user(self.request.user):
            raise PermissionDenied("Only sellers can view seller inventory.")
        return Product.objects.select_related("category", "seller").filter(seller=self.request.user)
