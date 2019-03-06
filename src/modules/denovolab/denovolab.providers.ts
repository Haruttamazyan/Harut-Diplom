import { denovolabHttpToken } from '../../constants';
import axios, { AxiosResponse } from 'axios';
import { DNL_BASE_URL, DNL_USER, DNL_PASSWORD, IS_VERBOSE } from '../../config';

export const denovolabProviders = [
  {
    provide: denovolabHttpToken,
    useFactory: async () => {
      const http = axios.create({
        baseURL: DNL_BASE_URL
      });

      // tslint:disable no-console
      const success = (response: AxiosResponse) => {
        if (IS_VERBOSE) {
          //console.log('DNL success response.data:');
          console.dir(response.data, { depth: 10 });
        }

        return response;
      };

      const error = (response: any) => {
        if (IS_VERBOSE) {
          //console.log('resp:', response);
          //console.log('DNL error response.response.data:');
          console.dir(response.response.data, { depth: 3 });
        }

        return Promise.reject(response);
      };

      http.interceptors.response.use(success, error);

      const { data } = await http.post('/auth', {
        email_or_name: DNL_USER,
        password: DNL_PASSWORD
      });

      const token = data.payload.token;

      if (IS_VERBOSE) {
        console.log(`Setting DNL token to "${token}".`);
      }

      http.defaults.headers['X-Auth-Token'] = token;

      return http;
    }
  }
];
