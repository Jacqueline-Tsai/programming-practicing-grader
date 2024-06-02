import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
    stages: [
        { duration: '30s', target: 50 },
        { duration: '1m', target: 100 },
        { duration: '30s', target: 0 },
    ],
};

export default function () {
    let user_uuid = '123e4567-e89b-12d3-a456-426614174000'; // Replace with a valid user_uuid
    let res = http.get(`http://localhost:7777/assignment/latest/${user_uuid}`);

    check(res, {
        'is status 200': (r) => r.status === 200,
        'response time is < 500ms': (r) => r.timings.duration < 500,
    });
    sleep(1);
}