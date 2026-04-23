from django.urls import path
from .views import FileUploadView, PendingUploadsListView, ApproveUploadView, RejectUploadView

urlpatterns = [
    path("upload/", FileUploadView.as_view()),
    path("review/pending/", PendingUploadsListView.as_view()),
    path("review/<int:pk>/approve/", ApproveUploadView.as_view()),
    path("review/<int:pk>/reject/", RejectUploadView.as_view()),
]