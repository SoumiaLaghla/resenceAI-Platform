# Generated by Django 5.1.1 on 2024-09-12 16:05

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='form',
            name='author',
        ),
        migrations.RemoveField(
            model_name='post',
            name='form',
        ),
        migrations.RemoveField(
            model_name='question',
            name='form',
        ),
        migrations.AddField(
            model_name='post',
            name='description',
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name='post',
            name='file',
            field=models.FileField(blank=True, null=True, upload_to='posts/'),
        ),
        migrations.DeleteModel(
            name='Answer',
        ),
        migrations.DeleteModel(
            name='Form',
        ),
        migrations.DeleteModel(
            name='Question',
        ),
    ]
