import { Factory, trait, Trait } from 'ember-cli-mirage';
import faker from 'faker';

import RegistrationProvider from 'ember-osf-web/models/registration-provider';

import { randomGravatar } from '../utils';

function randomAssets() {
    return {
        square_color_no_transparent: randomGravatar(100),
    };
}

export interface MirageRegistrationProvider extends RegistrationProvider {
    licensesAcceptableIds: string[];
}

export interface RegistrationProviderTraits {
    withBrand: Trait;
    withSchemas: Trait;
    submissionsNotAllowed: Trait;
}

export default Factory.extend<MirageRegistrationProvider & RegistrationProviderTraits>({
    name(i: number) {
        return `provider-${i}`;
    },
    description() {
        return faker.lorem.sentence();
    },
    allowSubmissions: true,
    brandedDiscoveryPage: true,
    assets: randomAssets(),

    afterCreate(provider, server) {
        provider.update({
            licensesAcceptable: [
                server.create('license', { name: 'MIT License' }),
                server.create('license', {
                    name: 'No license',
                    requiredFields: [
                        'year',
                        'copyrightHolders',
                    ],
                    text: 'Copyright {{year}} {{copyrightHolders}}',
                }),
            ],
        });
        if (!provider.shareSource) {
            provider.update({ shareSource: `share-${provider.name}` });
        }
    },

    withBrand: trait<RegistrationProvider>({
        afterCreate(provider, server) {
            provider.update({ brand: server.create('brand') });
        },
    }),
    withSchemas: trait<RegistrationProvider>({
        afterCreate(provider, server) {
            provider.update({ schemas: [server.schema.registrationSchemas.find('testSchema')] });
        },
    }),
    submissionsNotAllowed: trait<RegistrationProvider>({
        afterCreate(provider) {
            provider.update({ allowSubmissions: false });
        },
    }),
});

declare module 'ember-cli-mirage/types/registries/model' {
    export default interface MirageModelRegistry {
        'registration-provider': MirageRegistrationProvider;
    } // eslint-disable-line semi
}

declare module 'ember-cli-mirage/types/registries/schema' {
    export default interface MirageSchemaRegistry {
        registrationProvider: MirageRegistrationProvider;
    } // eslint-disable-line semi
}
