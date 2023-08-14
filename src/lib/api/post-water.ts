type Result = 'Success' | 'AuthError' | 'Error';

export default function postWater(entryIds: string[], password: string): Promise<Result> {
  return fetch(`${import.meta.env.VITE_API_BASE_URL ?? ''}/water`, {
    headers: {
      Authorization: `Basic ${btoa(`jfv:${password}`)}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(entryIds),
    method: 'POST',
  }).then(res => {
    switch (res.status) {
      case 204:
        return 'Success';
      case 401:
        return 'AuthError';
      default:
        return 'Error';
    }
  }).catch(_ => Promise.resolve('Error'));
}
