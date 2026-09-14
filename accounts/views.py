from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import User
from .serializers import UserSerializer, CustomTokenObtainPairSerializer
from .permissions import IsCommitteeOrSuperAdmin


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        data = serializer.data
        # If resident, also include resident profile
        if hasattr(request.user, "resident_profile") and request.user.resident_profile:
            resident = request.user.resident_profile
            data["resident_profile"] = {
                "id": resident.id,
                "flat_id": resident.flat_id,
                "flat_number": resident.flat.flat_number,
                "wing_name": resident.flat.wing.name,
                "is_primary": resident.is_primary,
                "move_in_date": resident.move_in_date,
            }
        else:
            data["resident_profile"] = None
        return Response(data)


from rest_framework.decorators import action

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by("username")
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.action == "me":
            return [IsAuthenticated()]
        return [IsCommitteeOrSuperAdmin()]

    @action(detail=False, methods=["get"])
    def me(self, request):
        serializer = UserSerializer(request.user)
        data = serializer.data
        if hasattr(request.user, "resident_profile") and request.user.resident_profile:
            resident = request.user.resident_profile
            data["resident_profile"] = {
                "id": resident.id,
                "flat_id": resident.flat_id,
                "flat_number": resident.flat.flat_number,
                "wing_name": resident.flat.wing.name if resident.flat.wing else "",
                "is_primary": resident.is_primary,
                "move_in_date": resident.move_in_date,
            }
        else:
            data["resident_profile"] = None
        return Response(data)
