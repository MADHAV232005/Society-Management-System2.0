from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from society.views import (
    SocietyViewSet,
    WingViewSet,
    FlatViewSet,
    ResidentViewSet,
)

from billing.views import (
    MaintenanceBillViewSet,
    PaymentViewSet,
    ReceiptViewSet,
)

from complaints.views import (
    ComplaintViewSet,
    ComplaintStatusHistoryViewSet,
)

from visitors.views import VisitorViewSet
from expenses.views import ExpenseViewSet
from staff.views import StaffViewSet
from documents.views import DocumentViewSet
from notifications.views import NotificationViewSet
from auditlogs.views import AuditLogViewSet
from notices.views import NoticeViewSet
from reports.views import ReportViewSet
from accounts.views import UserViewSet, CustomTokenObtainPairView, CurrentUserView
from rest_framework_simplejwt.views import TokenRefreshView


router = DefaultRouter()

# Auth & Users
router.register(r"users", UserViewSet, basename="user")

# Society
router.register(r"societies", SocietyViewSet, basename="society")
router.register(r"wings", WingViewSet, basename="wing")
router.register(r"flats", FlatViewSet, basename="flat")
router.register(r"residents", ResidentViewSet, basename="resident")

# Billing
router.register(
    r"maintenance-bills",
    MaintenanceBillViewSet,
    basename="maintenance-bill"
)
router.register(r"payments", PaymentViewSet, basename="payment")
router.register(r"receipts", ReceiptViewSet, basename="receipt")

# Complaints
router.register(r"complaints", ComplaintViewSet, basename="complaint")
router.register(
    r"complaint-history",
    ComplaintStatusHistoryViewSet,
    basename="complaint-history"
)

# Other modules
router.register(r"notices", NoticeViewSet, basename="notice")
router.register(r"visitors", VisitorViewSet, basename="visitor")
router.register(r"expenses", ExpenseViewSet, basename="expense")
router.register(r"staff", StaffViewSet, basename="staff")
router.register(r"documents", DocumentViewSet, basename="document")
router.register(r"notifications", NotificationViewSet, basename="notification")
router.register(r"audit-logs", AuditLogViewSet, basename="audit-log")
router.register(r"reports", ReportViewSet, basename="report")


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/login/", CustomTokenObtainPairView.as_view(), name="auth_login"),
    path("api/auth/refresh/", TokenRefreshView.as_view(), name="auth_refresh"),
    path("api/auth/me/", CurrentUserView.as_view(), name="auth_me"),
    path("api/token/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/", include(router.urls)),
]
