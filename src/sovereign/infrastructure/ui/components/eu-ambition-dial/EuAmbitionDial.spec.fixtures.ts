import { CountryFunding, CountryName } from '@/sovereign/domain/CountryFunding';
import { Grant, GrantId } from '@/sovereign/domain/Grant';
import { mount } from '@vue/test-utils';
import EuAmbitionDial from './EuAmbitionDial.vue';

export function buildCountryFunding(countryName: string, amountUsd: number): CountryFunding {
    const grant = new Grant(
        GrantId('rec1'),
        countryName,
        'Untitled grant',
        amountUsd,
        [],
        null,
        null,
        null,
        null,
        null,
        [],
        [],
        null,
    );
    return new CountryFunding(CountryName(countryName), [grant]);
}

export interface WrapperOptions {
    countryFundings?: readonly CountryFunding[];
    unattributedGrants?: readonly Grant[];
}

export function createWrapper(options: WrapperOptions = {}) {
    return mount(EuAmbitionDial, {
        props: { ...options },
    });
}
