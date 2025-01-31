import SwaggerParser from 'swagger-parser';
import SwaggerSpec from './openapi.json';
import { groupBy, keyBy, mapValues, values, flatten } from 'lodash';
import { initializeIndex } from './lunr.helper';
import lunr from 'lunr';

export interface Tag {
  name: string;
  description: string;
}

export interface ApiSection extends Tag {
  'x-id': string;
}

export interface ApiResource extends Tag {
  'x-section-id': string;
}

export interface ServerShape {
  description: string;
  url: string;
}

export interface OpenApiShape {
  info: any;
  components: {
    securitySchemes: any;
    schemas: any;
  };
  openapi: string;
  paths: {
    [path: string]: {
      [operation: string]: any;
    };
  };
  servers: ServerShape[];
  tags: (ApiSection | ApiResource)[];
}

export interface OrderCloudProps {
  openapi: OpenApiShape;
  sections: ApiSection[];
  resources: ApiResource[];
  index: lunr.Index;
  operations: any[];
  operationsById: {
    [operationId: string]: any;
  };
  operationsByResource: {
    [resource: string]: any[];
  };
}

export interface OrderCloudWindow extends Window {
  oc: OrderCloudProps;
}

declare let window: OrderCloudWindow;

export const Initialize = async () => {
  if (!window.oc) {
    const parsedSpec = await SwaggerParser.dereference(SwaggerSpec);
    const operations = flatten(
      values(
        mapValues(parsedSpec.paths, (ops, path) => {
          return values(
            mapValues(ops, (o, verb) => {
              const tags =
                o.tags[0] === 'Me' ? [GetSubSectionName(path)] : o.tags;
              return { ...o, verb, path, tags };
            })
          );
        })
      )
    );

    const resources = parsedSpec.tags
      .filter(tag => tag['x-section-id'])
      .concat(GetSubsectionsToAdd());

    window.oc = {
      openapi: parsedSpec,
      sections: parsedSpec.tags.filter(tag => tag['x-id']),
      resources,
      operations,
      index: initializeIndex(operations, resources),
      operationsById: keyBy(operations, 'operationId'),
      operationsByResource: groupBy(operations, o => {
        return o.tags[0];
      }),
    };
  }
};

export class OpenApi {
  get spec(): OpenApiShape {
    return window.oc.openapi;
  }
  get sections(): ApiSection[] {
    return window.oc.sections;
  }

  get resources(): ApiResource[] {
    return window.oc.resources;
  }

  get operations(): any[] {
    return window.oc.operations;
  }

  get index(): lunr.Index {
    return window.oc.index;
  }

  get operationsById(): {
    [operationId: string]: any;
  } {
    return window.oc.operationsById;
  }

  get operationsByResource(): {
    [resource: string]: any;
  } {
    return window.oc.operationsByResource;
  }

  public initialize = Initialize;

  public findResource(operationId: string): ApiResource | undefined {
    const operation = window.oc.operationsById[operationId];
    const resourceName = operation.tags[0];
    return window.oc.resources.find(resource => resource.name === resourceName);
  }

  public findOperation(operationId: string): any | undefined {
    const operation = window.oc.operationsById[operationId];
    if (operation.parameters && operation.parameters.length) {
      operation.parameters.map(param => {
        switch (param.schema.type) {
          case 'string':
            param.value = '';
            break;
          case 'integer':
            param.value = param.required ? 0 : undefined;
            break;
          case 'boolean':
            param.value = false;
          default:
            break;
        }
      });
    }
    return operation;
  }
}

/**
 * This section contains modifications to the OC API swagger spec.
 * They change how routes are grouped.
 * Instead of all the /me routes belonging directly to the MeAndMyStuff section, they are broken into subsections
 * Those new subsections are in the object below
 */

// This method is used to attach the correct subsection to routes.
const GetSubSectionName = (path: string) => {
  var sec = MeSubSections.find(sec => sec.paths.includes(path));
  return sec ? sec.name : null;
};

const GetSubsectionsToAdd = () => {
  return MeSubSections.filter(sec => sec.name !== 'Me'); // There is already a Me subsection
};

const MeSubSections = [
  {
    name: 'Me',
    'x-section-id': 'MeAndMyStuff',
    paths: ['/me', '/me/register', '/me/password'],
  },
  {
    name: 'My Cost Centers',
    'x-section-id': 'MeAndMyStuff',
    paths: ['/me/costcenters'],
  },
  {
    name: 'My User Groups',
    'x-section-id': 'MeAndMyStuff',
    paths: ['/me/usergroups'],
  },
  {
    name: 'My Addresses',
    'x-section-id': 'MeAndMyStuff',
    paths: ['/me/addresses', '/me/addresses/{addressID}'],
  },
  {
    name: 'My Credit Cards',
    'x-section-id': 'MeAndMyStuff',
    paths: ['/me/creditcards', '/me/creditcards/{creditcardID}'],
  },
  {
    name: 'My Categories',
    'x-section-id': 'MeAndMyStuff',
    paths: ['/me/categories', '/me/categories/{categoryID}'],
  },
  {
    name: 'My Products',
    'x-section-id': 'MeAndMyStuff',
    paths: [
      '/me/products',
      '/me/products/{productID}',
      '/me/products/{productID}/specs',
      '/me/products/{productID}/specs/{specID}',
    ],
  },
  {
    name: 'My Orders',
    'x-section-id': 'MeAndMyStuff',
    paths: ['/me/orders', '/me/orders/approvable'],
  },
  {
    name: 'My Promotions',
    'x-section-id': 'MeAndMyStuff',
    paths: ['/me/promotions', '/me/promotions/{promotionID}'],
  },
  {
    name: 'My Spending Accounts',
    'x-section-id': 'MeAndMyStuff',
    paths: ['/me/spendingAccounts', '/me/spendingaccounts/{spendingAccountID}'],
  },
  {
    name: 'My Shipments',
    'x-section-id': 'MeAndMyStuff',
    paths: [
      '/me/shipments',
      '/me/shipments/{shipmentID}',
      '/me/shipments/{shipmentID}/items',
    ],
  },
  {
    name: 'My Catalogs',
    'x-section-id': 'MeAndMyStuff',
    paths: ['/me/catalogs', '/me/catalogs/{catalogID}'],
  },
];

export default new OpenApi();
