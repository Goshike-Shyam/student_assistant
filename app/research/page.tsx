import { redirect } from 'next/navigation';

type SearchParams = Record<string, string | string[] | undefined>;

function toQueryString(searchParams: SearchParams): string {
	const params = new URLSearchParams();

	Object.entries(searchParams).forEach(([key, value]) => {
		if (typeof value === 'string') {
			params.set(key, value);
			return;
		}

		if (Array.isArray(value)) {
			value.forEach((entry) => params.append(key, entry));
		}
	});

	const query = params.toString();
	return query ? `?${query}` : '';
}

export default async function ResearchAliasPage({
	searchParams,
}: {
	searchParams: Promise<SearchParams>;
}) {
	const resolvedSearchParams = await searchParams;
	redirect(`/resources${toQueryString(resolvedSearchParams)}`);
}
