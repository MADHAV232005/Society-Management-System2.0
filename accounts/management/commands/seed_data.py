from datetime import date, timedelta
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.utils import timezone
from accounts.models import User
from society.models import Society, Wing, Flat, Resident
from billing.models import MaintenanceBill, Payment, Receipt
from complaints.models import Complaint, ComplaintStatusHistory
from notices.models import Notice
from visitors.models import Visitor
from staff.models import Staff
from expenses.models import Expense
from documents.models import Document
from notifications.models import Notification
from auditlogs.models import AuditLog


class Command(BaseCommand):
    help = "Seed initial real database records for Society Management System"

    def handle(self, *args, **options):
        self.stdout.write("Seeding database records...")

        # 1. Society
        society, _ = Society.objects.get_or_create(
            registration_number="REG/MUM/2020/7890",
            defaults={
                "name": "Green Valley Heights CHS",
                "address": "Plot 42, Palm Beach Road, Sector 19, Navi Mumbai - 400705",
                "email": "greenvalley@society.org",
                "phone": "+91 22 2789 4567",
                "is_active": True,
            },
        )

        # 2. Wings
        wing_a, _ = Wing.objects.get_or_create(
            society=society,
            name="A Wing",
        )
        wing_b, _ = Wing.objects.get_or_create(
            society=society,
            name="B Wing",
        )

        # 3. Flats
        flats = {}
        for wing, numbers in [(wing_a, ["101", "102", "201", "202"]), (wing_b, ["101", "102"])]:
            for num in numbers:
                floor_val = int(num[0])
                flat, _ = Flat.objects.get_or_create(
                    wing=wing,
                    flat_number=num,
                    defaults={
                        "floor": floor_val,
                        "area_sqft": Decimal("1150.00"),
                        "is_occupied": True if num in ["101", "102"] else False,
                        "is_active": True,
                    },
                )
                flats[f"{wing.name}-{num}"] = flat

        # 4. Users
        def get_or_create_user(username, email, first_name, last_name, role, password, phone=""):
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    "email": email,
                    "first_name": first_name,
                    "last_name": last_name,
                    "role": role,
                    "phone": phone,
                    "is_staff": True if role in [User.Role.SUPER_ADMIN, User.Role.COMMITTEE] else False,
                    "is_superuser": True if role == User.Role.SUPER_ADMIN else False,
                },
            )
            # Ensure password is set and hashed properly
            user.set_password(password)
            user.role = role
            user.phone = phone
            user.first_name = first_name
            user.last_name = last_name
            user.email = email
            user.save()
            return user

        admin_user = get_or_create_user(
            "admin", "admin@greenvalley.org", "Vikram", "Malhotra", User.Role.SUPER_ADMIN, "admin123", "+91 98200 11223"
        )
        committee_user = get_or_create_user(
            "committee", "committee@greenvalley.org", "Rajesh", "Sharma", User.Role.COMMITTEE, "committee123", "+91 98200 22334"
        )
        resident_user = get_or_create_user(
            "resident", "resident@greenvalley.org", "Amit", "Patel", User.Role.RESIDENT, "resident123", "+91 98200 33445"
        )
        resident2_user = get_or_create_user(
            "resident2", "priya@greenvalley.org", "Priya", "Desai", User.Role.RESIDENT, "resident123", "+91 98200 44556"
        )
        security_user = get_or_create_user(
            "security", "security@greenvalley.org", "Ramesh", "Singh", User.Role.SECURITY, "security123", "+91 98200 55667"
        )

        # 5. Resident Profiles
        flat_101 = flats["A Wing-101"]
        flat_102 = flats["A Wing-102"]

        Resident.objects.get_or_create(
            user=resident_user,
            defaults={
                "flat": flat_101,
                "is_primary": True,
                "is_active": True,
                "move_in_date": date(2022, 1, 15),
            },
        )
        Resident.objects.get_or_create(
            user=resident2_user,
            defaults={
                "flat": flat_102,
                "is_primary": True,
                "is_active": True,
                "move_in_date": date(2022, 6, 1),
            },
        )

        # 6. Maintenance Bills
        current_month = date(timezone.now().year, timezone.now().month, 1)
        due_date = current_month + timedelta(days=15)

        bill1, _ = MaintenanceBill.objects.get_or_create(
            flat=flat_101,
            billing_month=current_month,
            defaults={
                "due_date": due_date,
                "amount": Decimal("3500.00"),
                "status": MaintenanceBill.Status.PAID,
                "description": f"Monthly Maintenance Charges - {current_month:%B %Y}",
            },
        )

        bill2, _ = MaintenanceBill.objects.get_or_create(
            flat=flat_102,
            billing_month=current_month,
            defaults={
                "due_date": due_date,
                "amount": Decimal("3500.00"),
                "status": MaintenanceBill.Status.PENDING,
                "description": f"Monthly Maintenance Charges - {current_month:%B %Y}",
            },
        )

        bill3, _ = MaintenanceBill.objects.get_or_create(
            flat=flats["A Wing-201"],
            billing_month=current_month,
            defaults={
                "due_date": due_date,
                "amount": Decimal("3800.00"),
                "status": MaintenanceBill.Status.PARTIAL,
                "description": f"Monthly Maintenance & Sinking Fund - {current_month:%B %Y}",
            },
        )

        # 7. Payments & Receipts
        if not bill1.payments.exists():
            pay1 = Payment.objects.create(
                bill=bill1,
                amount=Decimal("3500.00"),
                payment_date=current_month + timedelta(days=4),
                payment_method=Payment.Method.UPI,
                transaction_reference="UPI/20260905/889102",
                notes="Paid via PhonePe",
            )
            Receipt.objects.create(
                payment=pay1,
                receipt_number="RCP-2026-001",
            )

        if not bill3.payments.exists():
            pay2 = Payment.objects.create(
                bill=bill3,
                amount=Decimal("2000.00"),
                payment_date=current_month + timedelta(days=7),
                payment_method=Payment.Method.BANK_TRANSFER,
                transaction_reference="IMPS9988112233",
                notes="Partial payment transferred via NetBanking",
            )
            Receipt.objects.create(
                payment=pay2,
                receipt_number="RCP-2026-002",
            )

        # 8. Complaints
        if not Complaint.objects.exists():
            c1 = Complaint.objects.create(
                resident=resident_user,
                flat=flat_101,
                category=Complaint.Category.PLUMBING,
                priority=Complaint.Priority.HIGH,
                status=Complaint.Status.IN_PROGRESS,
                title="Water leakage in master bathroom sink",
                description="Persistent water seepage noticed below the washbasin pipe joint.",
                assigned_to=committee_user,
            )
            ComplaintStatusHistory.objects.create(
                complaint=c1,
                old_status="OPEN",
                new_status="IN_PROGRESS",
                changed_by=committee_user,
                remarks="Assigned society plumber Mukesh Kumar to visit today at 4 PM.",
            )

            Complaint.objects.create(
                resident=resident2_user,
                flat=flat_102,
                category=Complaint.Category.ELECTRICAL,
                priority=Complaint.Priority.MEDIUM,
                status=Complaint.Status.RESOLVED,
                title="Corridor light flickering outside Flat 102",
                description="The LED tube light in the corridor outside 102 flickers continuously at night.",
                assigned_to=admin_user,
                resolution_notes="Replaced LED driver and tubelight.",
                resolved_at=timezone.now(),
            )

            Complaint.objects.create(
                resident=resident_user,
                flat=flat_101,
                category=Complaint.Category.CLEANING,
                priority=Complaint.Priority.LOW,
                status=Complaint.Status.OPEN,
                title="Staircase sweeping required for Wing A 1st Floor",
                description="Dust accumulated near the fire exit staircase on 1st floor landing.",
            )

        # 9. Notices
        if not Notice.objects.exists():
            Notice.objects.create(
                title="Annual General Body Meeting (AGM) 2026",
                content="All society members are cordially requested to attend the AGM scheduled for September 28, 2026 at 10:00 AM in the Clubhouse. The agenda includes audited balance sheet approval and committee elections.",
                notice_type=Notice.NoticeType.EVENT,
                priority=Notice.Priority.HIGH,
                published_by=committee_user,
                expiry_date=date(2026, 9, 30),
                is_active=True,
            )
            Notice.objects.create(
                title="Water Tank Chlorination & Cleaning Schedule",
                content="Please be informed that underground and overhead domestic water tanks will be cleaned on Wednesday from 10:00 AM to 3:00 PM. Water supply will remain suspended during this interval.",
                notice_type=Notice.NoticeType.MAINTENANCE,
                priority=Notice.Priority.MEDIUM,
                published_by=admin_user,
                expiry_date=date(2026, 9, 20),
                is_active=True,
            )
            Notice.objects.create(
                title="Fire Safety & Evacuation Drill Announcement",
                content="The local fire station will conduct a 30-minute safety demonstration and fire alarm test this Saturday at 11:30 AM in the central courtyard.",
                notice_type=Notice.NoticeType.GENERAL,
                priority=Notice.Priority.LOW,
                published_by=committee_user,
                expiry_date=date(2026, 10, 15),
                is_active=True,
            )

        # 10. Visitors
        if not Visitor.objects.exists():
            Visitor.objects.create(
                visitor_name="Suresh Verma",
                phone="+91 98765 43210",
                flat=flat_101,
                visit_type=Visitor.VisitType.GUEST,
                purpose="Family Visit",
                vehicle_number="MH-04-AB-1234",
                status=Visitor.Status.CHECKED_IN,
                checked_in_at=timezone.now() - timedelta(hours=2),
                registered_by=security_user,
            )
            Visitor.objects.create(
                visitor_name="Amazon Delivery (Kiran P.)",
                phone="+91 98112 23344",
                flat=flat_102,
                visit_type=Visitor.VisitType.DELIVERY,
                purpose="Package Delivery",
                vehicle_number="MH-43-XY-9081",
                status=Visitor.Status.EXPECTED,
                registered_by=resident2_user,
            )
            Visitor.objects.create(
                visitor_name="Dr. Arvind Mehta",
                phone="+91 99887 76655",
                flat=flat_101,
                visit_type=Visitor.VisitType.SERVICE,
                purpose="Medical Consultation",
                status=Visitor.Status.CHECKED_OUT,
                checked_in_at=timezone.now() - timedelta(hours=5),
                checked_out_at=timezone.now() - timedelta(hours=3),
                registered_by=security_user,
            )

        # 11. Staff
        if not Staff.objects.exists():
            Staff.objects.create(
                name="Ramesh Singh",
                phone="+91 98200 55667",
                staff_type=Staff.StaffType.SECURITY,
                address="Main Gate Security Cabin",
                joining_date=date(2021, 3, 1),
                salary=Decimal("22000.00"),
                is_active=True,
            )
            Staff.objects.create(
                name="Sunita Bai",
                phone="+91 98334 45566",
                staff_type=Staff.StaffType.CLEANING,
                address="Sector 20, Vashi, Navi Mumbai",
                joining_date=date(2022, 5, 10),
                salary=Decimal("14000.00"),
                is_active=True,
            )
            Staff.objects.create(
                name="Mukesh Kumar",
                phone="+91 98445 56677",
                staff_type=Staff.StaffType.MAINTENANCE,
                address="Nerul West, Navi Mumbai",
                joining_date=date(2021, 8, 15),
                salary=Decimal("19500.00"),
                is_active=True,
            )
            Staff.objects.create(
                name="Ram Lal",
                phone="+91 98556 67788",
                staff_type=Staff.StaffType.GARDENER,
                address="Sanpada, Navi Mumbai",
                joining_date=date(2023, 1, 1),
                salary=Decimal("15000.00"),
                is_active=True,
            )

        # 12. Expenses
        if not Expense.objects.exists():
            Expense.objects.create(
                title="Security Agency Monthly Service - Aug 2026",
                description="Deployed 4 guards 24/7 across Main Gate and Tower B.",
                category=Expense.Category.SECURITY,
                amount=Decimal("44000.00"),
                expense_date=date(2026, 9, 2),
                vendor_name="Suraksha Guarding Services Pvt Ltd",
                invoice_number="INV-SGS-4421",
                recorded_by=committee_user,
                is_active=True,
            )
            Expense.objects.create(
                title="MSEB Common Utilities Electricity Bill",
                description="Common area lights, pump house, and club house consumption.",
                category=Expense.Category.ELECTRICITY,
                amount=Decimal("28500.00"),
                expense_date=date(2026, 9, 5),
                vendor_name="Maharashtra State Electricity Board",
                invoice_number="CA-029910291-SEP",
                recorded_by=admin_user,
                is_active=True,
            )
            Expense.objects.create(
                title="Elevator AMC Maintenance - Q3",
                description="Quarterly preventive maintenance and safety test for 4 lifts.",
                category=Expense.Category.MAINTENANCE,
                amount=Decimal("18500.00"),
                expense_date=date(2026, 9, 8),
                vendor_name="Otis Elevator Company India",
                invoice_number="AMC-OTIS-88219",
                recorded_by=committee_user,
                is_active=True,
            )

        # 13. Documents
        if not Document.objects.exists():
            Document.objects.create(
                title="Society Registered Bye-Laws 2026",
                description="Complete model bye-laws registered with District Co-operative Registrar.",
                uploaded_by=admin_user,
                is_active=True,
            )
            Document.objects.create(
                title="Fire Department Safety Audit Certificate",
                description="NOC and annual clearance certificate issued by NMMC Fire Department.",
                uploaded_by=admin_user,
                is_active=True,
            )
            Document.objects.create(
                title="Statutory Financial Audit Report FY 2025-26",
                description="Audited financial balance sheet and P&L statement verified by CA.",
                uploaded_by=committee_user,
                is_active=True,
            )

        # 14. Notifications
        if not Notification.objects.exists():
            Notification.objects.create(
                user=resident_user,
                title="Maintenance Payment Confirmed",
                message="Your maintenance payment of ₹3,500 for Sep 2026 has been credited. Receipt #RCP-2026-001 is ready.",
                notification_type=Notification.NotificationType.PAYMENT,
                is_read=True,
            )
            Notification.objects.create(
                user=resident_user,
                title="Complaint Status Update",
                message="Your bathroom leakage complaint #1 is now In Progress. Assigned to plumber Mukesh Kumar.",
                notification_type=Notification.NotificationType.COMPLAINT,
                is_read=False,
            )
            Notification.objects.create(
                user=resident_user,
                title="Notice: AGM on Sep 28",
                message="Annual General Body Meeting notice has been published. Please check the notice board.",
                notification_type=Notification.NotificationType.NOTICE,
                is_read=False,
            )

        # 15. Audit Logs
        if not AuditLog.objects.exists():
            AuditLog.objects.create(
                user=admin_user,
                action="USER_LOGIN",
                module="accounts",
                description="Super Admin logged into Society Portal",
                ip_address="127.0.0.1",
            )
            AuditLog.objects.create(
                user=committee_user,
                action="BILL_GENERATION",
                module="billing",
                description="Generated September 2026 maintenance bills for 6 flats",
                ip_address="127.0.0.1",
            )
            AuditLog.objects.create(
                user=security_user,
                action="VISITOR_ENTRY",
                module="visitors",
                description="Recorded visitor Suresh Verma entry for Flat 101",
                ip_address="127.0.0.1",
            )

        self.stdout.write(self.style.SUCCESS("Database seeding completed successfully!"))
