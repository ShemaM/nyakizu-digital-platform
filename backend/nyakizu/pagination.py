"""
nyakizu/pagination.py

The global DEFAULT_PAGINATION_CLASS (PAGE_SIZE=20) is tuned for product
browsing. Several endpoints instead back a dashboard total or an "all my
orders" list, where a buyer/seller genuinely needs everything that exists
right now, not a 20-at-a-time feed — but "everything" must still be a
*bounded* everything, not a truly unlimited query. This gives those views
a much larger default and an explicit, capped ceiling: callers that need
the full picture pass ?page_size=200 (see frontend `orders.ts`), while the
endpoint itself can never be made to return an unbounded result set no
matter what a client asks for.
"""

from rest_framework.pagination import PageNumberPagination


class LargeResultsSetPagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = "page_size"
    max_page_size = 200
