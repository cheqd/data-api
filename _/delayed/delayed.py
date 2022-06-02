import csv
import requests

def main():
    input = []
    with open('./input/delayed.csv', 'r') as f:
        reader = csv.reader(f)
        for row in reader:
            account = requests.get(
                f'https://api.cheqd.net/cosmos/auth/v1beta1/accounts/{row[0]}',
                headers={
                    'Content-Type': 'application/json',
                }
            ).json()

            if account.get('account', None) and account['account']['@type'] == '/cosmos.vesting.v1beta1.DelayedVestingAccount' and account['account']['base_vesting_account']['base_account']['sequence'] == '0':
                input.append(row)

    if not input: print('No accounts found to be marked as delayed.\n'); exit(0)

    with open('./output/delayed.csv', 'w') as f:
        writer = csv.writer(f, lineterminator='\n')
        writer.writerows(input)

if __name__ == '__main__':
    main()