import path from 'path';

import { PactV3, MatchersV3 } from '@pact-foundation/pact';

import { initializeMockApp, getConfig, setConfig } from '@edx/frontend-platform';
import { getAccount } from './services';

const expectedUserInfo200 = {
  loading: false,
  error: null,
  username: 'staff',
  email: 'staff@example.com',
  bio: 'This is my bio',
  name: 'Lemon Seltzer',
  country: 'ME',
  socialLinks: [
    {
      platform: 'facebook',
      socialLink: 'https://www.facebook.com/aloha',
    },
    {
      platform: 'twitter',
      socialLink: 'https://www.twitter.com/ALOHA',
    },
  ],
  profileImage: {
    imageUrlFull: 'http://localhost:18000/media/profile-images/d2a9bdc2ba165dcefc73265c54bf9a20_500.jpg?v=1552495012',
    imageUrlLarge: 'http://localhost:18000/media/profile-images/d2a9bdc2ba165dcefc73265c54bf9a20_120.jpg?v=1552495012',
    imageUrlMedium: 'http://localhost:18000/media/profile-images/d2a9bdc2ba165dcefc73265c54bf9a20_50.jpg?v=1552495012',
    imageUrlSmall: 'http://localhost:18000/media/profile-im ages/d2a9bdc2ba165dcefc73265c54bf9a20_30.jpg?v=1552495012',
    hasImage: true,
  },
  levelOfEducation: 'el',
  mailingAddress: null,
  extendedProfile: [],
  dateJoined: '2017-06-07T00:44:23Z',
  accomplishmentsShared: false,
  isActive: true,
  yearOfBirth: 1901,
  goals: null,
  languageProficiencies: [
    {
      code: 'yo',
    },
  ],
  courseCertificates: null,
  requiresParentalConsent: false,
  secondaryEmail: null,
  timeZone: null,
  gender: null,
  accountPrivacy: 'custom',
  learningGoal: 'advance_career',
};

const provider = new PactV3({
  log: path.resolve(process.cwd(), 'src/pact-logs/pact.log'),
  dir: path.resolve(process.cwd(), 'src/pacts'),
  consumer: 'frontend-app-profile',
  provider: 'edx-platform',
});

describe('getAccount for one username', () => {
  beforeAll(async () => {
    initializeMockApp();
  });
  it('returns a HTTP 200 and user information', async () => {
    const usernameEdpt200 = 'staff';
    await provider.addInteraction({
      states: [{ description: "I have a user's basic information" }],
      uponReceiving: "A request for user's basic information",
      withRequest: {
        method: 'GET',
        path: `/api/user/v1/accounts/${usernameEdpt200}`,
        headers: { Accept: 'application/json' },
      },
      willRespondWith: {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: MatchersV3.like(expectedUserInfo200),
      },
    });
    return provider.executeTest(async (mockserver) => {
      setConfig({
        ...getConfig(),
        LMS_BASE_URL: mockserver.url,
      });
      const response = await getAccount(usernameEdpt200);
      expect(response).toEqual(expectedUserInfo200);
    });
  });

  it('Account does not exist', async () => {
    const usernameEdpt404 = 'staff_not_found';
    await provider.addInteraction({
      states: [{ description: "Account and user's information does not exist" }],
      uponReceiving: "A request for user's basic information",
      withRequest: {
        method: 'GET',
        path: `/api/user/v1/accounts/${usernameEdpt404}`,
      },
      willRespondWith: {
        status: 404,
      },
    });
    await provider.executeTest(async (mockserver) => {
      setConfig({
        ...getConfig(),
        LMS_BASE_URL: mockserver.url,
      });
      await expect(getAccount(usernameEdpt404).then((response) => response.data)).rejects.toThrow('Request failed with status code 404');
    });
  });
});
