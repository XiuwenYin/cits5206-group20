from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

# Sets up user and tests authenication for them
class AuthTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='pass'
        )
        self.client = APIClient()

    def test_jwt_token_and_admin_check(self):
        res = self.client.post('/api/auth/token/', {
            'username': 'admin',
            'password': 'pass'
        }, format='json')
        self.assertEqual(res.status_code, 200)
        self.assertIn('access', res.data)
        token = res.data['access']

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        res2 = self.client.get('/api/auth/check/')
        self.assertEqual(res2.status_code, 200)
        self.assertTrue(res2.data['is_staff'])