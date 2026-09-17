from fastapi.testclient import TestClient
from backend.main import app
client=TestClient(app)
def test_health(): assert client.get('/api/health').status_code==200
def test_tasks(): assert len(client.get('/api/tasks').json())==5
def test_unclear_owner():
    data=client.post('/api/chat',json={'question':'Who owns the Mumbai lease?'}).json()
    assert 'unclear' in data['answer'].lower()
    assert data['grounded'] is True
