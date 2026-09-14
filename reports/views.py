from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Count
from accounts.permissions import IsCommitteeOrSuperAdmin
from billing.models import MaintenanceBill, Payment
from expenses.models import Expense
from complaints.models import Complaint
from society.models import Flat, Resident, Wing
from visitors.models import Visitor
from staff.models import Staff


class ReportViewSet(viewsets.ViewSet):
    permission_classes = [IsCommitteeOrSuperAdmin]

    def list(self, request):
        total_billed = float(MaintenanceBill.objects.aggregate(total=Sum("amount"))["total"] or 0)
        total_collected = float(Payment.objects.aggregate(total=Sum("amount"))["total"] or 0)
        outstanding_dues = max(0.0, total_billed - total_collected)
        total_expenses = float(Expense.objects.aggregate(total=Sum("amount"))["total"] or 0)
        net_balance = total_collected - total_expenses

        total_flats = Flat.objects.count()
        occupied_flats = Flat.objects.filter(residents__isnull=False).distinct().count()
        vacant_flats = max(0, total_flats - occupied_flats)
        occupancy_rate = round((occupied_flats / total_flats * 100) if total_flats > 0 else 0, 1)

        total_complaints = Complaint.objects.count()
        open_complaints = Complaint.objects.filter(
            status__in=[Complaint.Status.OPEN, Complaint.Status.IN_PROGRESS]
        ).count()
        resolved_complaints = Complaint.objects.filter(status=Complaint.Status.RESOLVED).count()

        total_staff = Staff.objects.count()
        monthly_payroll = float(
            Staff.objects.filter(is_active=True).aggregate(total=Sum("salary"))["total"] or 0
        )
        total_visitors = Visitor.objects.count()
        checked_in_visitors = Visitor.objects.filter(status=Visitor.Status.CHECKED_IN).count()

        return Response({
            "financial": {
                "total_billed": total_billed,
                "total_collected": total_collected,
                "outstanding_dues": outstanding_dues,
                "total_expenses": total_expenses,
                "net_balance": net_balance,
                "collection_rate_percent": round(
                    (total_collected / total_billed * 100) if total_billed > 0 else 0, 1
                ),
            },
            "occupancy": {
                "total_flats": total_flats,
                "occupied_flats": occupied_flats,
                "vacant_flats": vacant_flats,
                "occupancy_rate_percent": occupancy_rate,
                "total_residents": Resident.objects.count(),
            },
            "complaints": {
                "total": total_complaints,
                "open": open_complaints,
                "resolved": resolved_complaints,
                "resolution_rate_percent": round(
                    (resolved_complaints / total_complaints * 100) if total_complaints > 0 else 0, 1
                ),
            },
            "operations": {
                "total_staff": total_staff,
                "monthly_payroll": monthly_payroll,
                "total_visitors": total_visitors,
                "checked_in_visitors": checked_in_visitors,
            },
        })

    @action(detail=False, methods=["get"])
    def financial(self, request):
        total_billed = float(MaintenanceBill.objects.aggregate(total=Sum("amount"))["total"] or 0)
        total_collected = float(Payment.objects.aggregate(total=Sum("amount"))["total"] or 0)
        total_expenses = float(Expense.objects.aggregate(total=Sum("amount"))["total"] or 0)

        expenses_by_category = list(
            Expense.objects.values("category")
            .annotate(total=Sum("amount"), count=Count("id"))
            .order_by("-total")
        )
        for e in expenses_by_category:
            e["total"] = float(e["total"])

        bills_by_status = list(
            MaintenanceBill.objects.values("status")
            .annotate(total=Sum("amount"), count=Count("id"))
            .order_by("status")
        )
        for b in bills_by_status:
            b["total"] = float(b["total"])

        return Response({
            "total_billed": total_billed,
            "total_collected": total_collected,
            "outstanding_dues": max(0.0, total_billed - total_collected),
            "total_expenses": total_expenses,
            "net_balance": total_collected - total_expenses,
            "expenses_by_category": expenses_by_category,
            "bills_by_status": bills_by_status,
        })

    @action(detail=False, methods=["get"])
    def occupancy(self, request):
        wings_summary = []
        for wing in Wing.objects.all():
            flats = wing.flats.all()
            total_in_wing = flats.count()
            occupied_in_wing = flats.filter(residents__isnull=False).distinct().count()
            wings_summary.append({
                "wing_id": wing.id,
                "wing_name": wing.name,
                "total_flats": total_in_wing,
                "occupied_flats": occupied_in_wing,
                "vacant_flats": max(0, total_in_wing - occupied_in_wing),
            })
        return Response({
            "total_flats": Flat.objects.count(),
            "total_residents": Resident.objects.count(),
            "wings": wings_summary,
        })

    @action(detail=False, methods=["get"])
    def complaints(self, request):
        status_counts = list(
            Complaint.objects.values("status")
            .annotate(count=Count("id"))
            .order_by("status")
        )
        priority_counts = list(
            Complaint.objects.values("priority")
            .annotate(count=Count("id"))
            .order_by("priority")
        )
        category_counts = list(
            Complaint.objects.values("category")
            .annotate(count=Count("id"))
            .order_by("category")
        )
        return Response({
            "total": Complaint.objects.count(),
            "by_status": status_counts,
            "by_priority": priority_counts,
            "by_category": category_counts,
        })
