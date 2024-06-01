import http from 'k6/http';
import { check } from 'k6';
import { sleep } from 'k6';

export let options = {
    vus: 100,
    duration: '30s',
};

export default function () {
    const data = {
        user_uuid: '4515d960-1e60-4712-9e81-bbef7bf244fb',
        answer: 'def hello(): return"hello world")',
    };

    const params = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    let response = http.post('http://localhost:7800/api/grader/submit/answer', JSON.stringify(data), params);

    check(response, {
        'is status 200': (r) => r.status === 200,
    });
    sleep(1);
}