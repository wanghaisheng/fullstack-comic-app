# Generated by Django 3.2.5 on 2022-11-03 02:02

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('comics', '0013_delete_coin'),
    ]

    operations = [
        migrations.AddField(
            model_name='payment',
            name='category',
            field=models.CharField(choices=[('C', 'COIN')], default='C', max_length=2),
        ),
        migrations.AddField(
            model_name='payment',
            name='chapter',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='comics.chapter'),
        ),
        migrations.AddField(
            model_name='payment',
            name='is_complete',
            field=models.BooleanField(default=False, null=True),
        ),
        migrations.AddField(
            model_name='payment',
            name='product',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='comics.product'),
        ),
        migrations.AlterField(
            model_name='product',
            name='category',
            field=models.CharField(choices=[('C', 'COIN')], default='C', max_length=2),
        ),
    ]
