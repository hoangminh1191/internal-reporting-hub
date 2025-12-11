// using global fetch
const API_URL = 'http://localhost:3001/api/submissions';

async function main() {
    console.log('📊 Testing Aggregation API...');

    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Failed to fetch: ' + res.statusText);

    const submissions: any[] = await res.json();
    console.log(`✅ Fetched ${submissions.length} submissions.`);

    if (submissions.length > 0) {
        const first = submissions[0];
        console.log('Sample Submission Data:', JSON.stringify(first.data));
        if (typeof first.data === 'string') {
            console.error('❌ Data should be parsed JSON object, but got string. Backend might be sending stringified JSON?');
            // In index.ts, we did: data: JSON.parse(s.data)
            // So it should be object.
        } else {
            console.log('✅ Data field is correctly an object.');
        }
    }
}

main().catch(console.error);
