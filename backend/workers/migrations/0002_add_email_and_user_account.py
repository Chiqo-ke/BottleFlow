# Generated migration for Worker model updates

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('workers', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='worker',
            name='email',
            field=models.EmailField(blank=True, help_text='Required for manager role', null=True),
        ),
        migrations.AddField(
            model_name='worker',
            name='user_account',
            field=models.OneToOneField(blank=True, help_text='Associated user account for managers', null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL),
        ),
    ]
