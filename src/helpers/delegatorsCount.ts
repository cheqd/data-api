import { CachedTotalDelegatorsCount } from '../types/node';
import { LATEST_TOTAL_DELEGATORS_COUNT } from './constants';

export async function cacheDelegatorsCount(totalDeleagatorsCount: number) {
  const data = {
    totalDelegatorsCount: totalDeleagatorsCount,
    updatedAt: new Date().toUTCString(),
  };
  await TOTAL_DELEGATORS_COUNT_ACROSS_EVERY_VALIDATOR.put(
    LATEST_TOTAL_DELEGATORS_COUNT,
    JSON.stringify(data)
  );
}

export async function getCachedTotalDelegatorsCount(): Promise<CachedTotalDelegatorsCount | null> {
  try {
    let value = await TOTAL_DELEGATORS_COUNT_ACROSS_EVERY_VALIDATOR.get(
      LATEST_TOTAL_DELEGATORS_COUNT
    );

    return JSON.parse(value!!) as CachedTotalDelegatorsCount;
  } catch (e: any) {
    console.error(`getCachedTotalDelegatorsCount: ${e}`);
    return null;
  }
}
