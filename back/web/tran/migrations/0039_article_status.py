# Generated by Django 2.2.3 on 2019-09-16 14:45

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tran', '0038_auto_20190915_0447'),
    ]

    operations = [
        migrations.AddField(
            model_name='article',
            name='status',
            field=models.CharField(blank=True, choices=[('1', '草稿'), ('2', '发布')], default='1', max_length=24),
        ),
    ]
