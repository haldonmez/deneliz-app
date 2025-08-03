from rest_framework import serializers
from .models import CustomKullanici

class CustomKullaniciSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomKullanici
        fields = '__all__'
