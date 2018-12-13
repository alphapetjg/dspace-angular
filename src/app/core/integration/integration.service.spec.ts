import { cold, getTestScheduler } from 'jasmine-marbles';
import { TestScheduler } from 'rxjs/testing';
import { getMockRequestService } from '../../shared/mocks/mock-request.service';
import { ResponseCacheService } from '../cache/response-cache.service';

import { RequestService } from '../data/request.service';
import { IntegrationRequest } from '../data/request.models';
import { HALEndpointService } from '../shared/hal-endpoint.service';
import { HALEndpointServiceStub } from '../../shared/testing/hal-endpoint-service-stub';
import { IntegrationService } from './integration.service';
import { IntegrationSearchOptions } from './models/integration-options.model';
import { RemoteDataBuildService } from '../cache/builders/remote-data-build.service';
import { getMockRemoteDataBuildService } from '../../shared/mocks/mock-remote-data-build.service';

const LINK_NAME = 'authorities';
const ENTRIES = 'entries';
const ENTRY_VALUE = 'entryValue';

class TestService extends IntegrationService {
  protected linkPath = LINK_NAME;
  protected entriesEndpoint = ENTRIES;
  protected entryValueEndpoint = ENTRY_VALUE;

  constructor(
    protected responseCache: ResponseCacheService,
    protected requestService: RequestService,
    protected rdbService: RemoteDataBuildService,
    protected halService: HALEndpointService) {
    super();
  }
}

describe('IntegrationService', () => {
  let scheduler: TestScheduler;
  let service: TestService;
  let responseCache: ResponseCacheService;
  let requestService: RequestService;
  let rdbService: RemoteDataBuildService;
  let halService: any;
  let findOptions: IntegrationSearchOptions;

  const name = 'type';
  const metadata = 'dc.type';
  const query = '';
  const uuid = 'd9d30c0c-69b7-4369-8397-ca67c888974d';
  const integrationEndpoint = 'https://rest.api/integration';
  const serviceEndpoint = `${integrationEndpoint}/${LINK_NAME}`;
  const entriesEndpoint = `${serviceEndpoint}/${name}/entries?query=${query}&metadata=${metadata}&uuid=${uuid}`;

  findOptions = new IntegrationSearchOptions(uuid, name, metadata);

  function initMockResponseCacheService(isSuccessful: boolean): ResponseCacheService {
    return jasmine.createSpyObj('responseCache', {
      get: cold('c-', {
        c: {response: {isSuccessful}}
      })
    });
  }

  function initTestService(): TestService {
    return new TestService(
      responseCache,
      requestService,
      rdbService,
      halService
    );
  }

  beforeEach(() => {
    responseCache = initMockResponseCacheService(true);
    requestService = getMockRequestService();
    rdbService = getMockRemoteDataBuildService();
    scheduler = getTestScheduler();
    halService = new HALEndpointServiceStub(integrationEndpoint);
    findOptions = new IntegrationSearchOptions(uuid, name, metadata, query);
    service = initTestService();

  });

  describe('getEntriesByName', () => {

    it('should configure a new IntegrationRequest', () => {
      const expected = new IntegrationRequest(requestService.generateRequestId(), entriesEndpoint);
      scheduler.schedule(() => service.getEntriesByName(findOptions).subscribe());
      scheduler.flush();

      expect(requestService.configure).toHaveBeenCalledWith(expected);
    });
  });

});
