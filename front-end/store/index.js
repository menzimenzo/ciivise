import Vue from 'vue'
import { get } from 'lodash'
import { parseErrorMessage, formatEmail } from '~/lib/utils'
import logger from '~/plugins/logger'
const log = logger('store:index')

export const state = () => ({
  interventions: [],
  interventionCourrante: {},
  utilisateurCourant: null,
  mesPiscines: null,
  maPiscine: {},
  utilisateurSelectionne: [],
  users: [],
  structures: [],
  documents: [],
  statStructure: [],
  enfants: [],
});

export const mutations = {
  CLEAR(state) {
    log.i('mutations::demande/CLEAR')
    const initial = defaultState()
    Object.keys(initial).forEach(k => {
      state[k] = initial[k]
    })
  },
  SET(state, { key, value }) {
    log.i(`mutations::SET:${key}`, { value, key })
    const splitted = key && key.split('.')
    const lastKey = splitted.pop()
    let origin = state
    splitted.forEach(p => {
      // Si origin est vide et n'est pas un Boolean alors définir origin comme Object vide
      if (!origin[p] && typeof origin[p] !== 'boolean') Vue.set(origin, p, {})
      origin = origin[p]
    })
    Vue.set(origin, lastKey, value)
  },
  UNSET(state, { key }) {
    log.i(`mutations::UNSET:${key}`)
    const splitted = key.split('.')
    const lastKey = splitted.pop()
    let origin = state
    splitted.forEach(p => {
      // Si origin est vide et n'est pas un Boolean alors définir origin comme Object vide
      if (!origin[p] && typeof origin[p] !== 'boolean') Vue.set(origin, p, {})
      origin = origin[p]
    })
    Vue.set(origin, lastKey, null)
  },
  UPDATE_ARRAY_ELM(state, { key, value, index }) {
    log.i('mutations::index/UPDATE_ARRAY_ELM', { key, value })
    const data = _.get(state, key)
    if(!index) {
      const i = data.findIndex(d => d.id === value.id)
      if (i === -1) {
          log.w('mutations::index/UPDATE_ARRAY_ELM', 'Élément non présent dans la liste')
          return data.push(value)
      }
      return Vue.set(data, i, value)
    }
    return Vue.set(data, index, value)
  },
  CLEAN(state, { key, isArray=false }) {
    log.i(`mutations::CLEAN:`, { key, isArray })
    return state[key] = isArray ? [] : {}
  },
  SPLICE(state,{ key, index }) {
    log.i(`mutations::splice`, { key })
    if ( index > -1) {
      state[key].splice(index,1);
    }
    else {
      state[key].splice(-1);
    }
  },
  SPLICE_END(state,{ key, number }) {
    log.i(`mutations::splice`, { key })
    const length = state[key].length
    if (number > length) {
      return state[key] = []
    } else {
      state[key].splice(length - number, number);
    }
  },
  put_user(state, { utilisateurSelectionne, index }) {
    log.i(`mutations::put_user`)
    return Vue.set(state.utilisateurSelectionne, index, utilisateurSelectionne);
  },
  set_statStructure(state, statStructure) {
    log.i(`mutations::set_statStructure`)
    state.statStructure = statStructure;
  },
};

export const actions = {
  nuxtServerInit({ commit }, { req, route }) {
    // Transition states
    log.i('actions::nuxtServerInit - Loading user')
    if (route.path.indexOf('/connexion/logout') === 0) {
      return
    }
    return this.$axios.$get(process.env.PROXY_URL + '/backend/api/connexion/user').then(utilisateur => {
      log.i('actions::nuxtServerInit - Done')
      return commit('SET', { key: 'utilisateurCourant', value: utilisateur})
    }).catch((err) => {
      log.w('actions::nuxtServerInit - Error - nuxtServerInit', err.stack)
    })
  },
  get_interventions({ commit, state }) {
    log.i("actions::get_interventions - In");
    const url = process.env.API_URL + "/interventions";
    return this.$axios.$get(url)
      .then(response => {
        response.interventions.forEach(intervention => {
          intervention.dateCreation = new Date(intervention.dateCreation)
        })
        log.i("actions::get_interventions - Done");
        return commit("SET", { key: 'interventions', value: response.interventions });
      })
      .catch(error => {
        log.w("actions::Une erreur est survenue lors de la récupération des interventions", error);
        commit('CLEAN', { key: 'interventions', isArray: true })
      })
  },
  get_intervention({ commit, state }, idIntervention) {
    log.i("actions::get_intervention - In");  
    const url = process.env.API_URL + "/interventions/" + idIntervention;
    return this.$axios.$get(url)
      .then(response => {
        const intervention = response.intervention
        intervention.dateCreation = new Date(intervention.dateCreation)
        log.i("actions::get_intervention - done", { intervention });
        commit("SET", { key: 'enfants', value: intervention.enfant })
        return commit("SET", { key: 'interventionCourrante', value: intervention });
      })
      .catch(error => {
        log.w("actions::get_intervention - erreur", error);
      })
  },
  post_intervention({ commit, state }, intervention) {
    log.i("actions::post_intervention - In", { intervention });  
    intervention.utilisateurId = state.utilisateurCourant.id
    const url = process.env.API_URL + "/interventions";
    
    return this.$axios.$post(url, { intervention }).then(({ intervention }) => {
      commit('UPDATE_ARRAY_ELM', { key: 'interventions', value: intervention })
      return intervention
    })
    .catch(error => {
      log.w("actions::post_intervention - erreur", error)
      const message = parseErrorMessage(get(error, 'response.data.message')) || error.message
      this.$toast.error(message)
      throw new Error(message)
    })
  },
  put_intervention({ commit, state }, intervention) {
    log.i("actions::put_intervention - In", { intervention })
    const url = process.env.API_URL + "/interventions/" + intervention.id
    intervention.utilisateurId = state.utilisateurCourant.id
    return this.$axios.$put(url, { intervention }).then(({ intervention }) => {
      commit('UPDATE_ARRAY_ELM', { key: 'interventions', value: intervention })
      return intervention
    })
    .catch(error => {
      log.w("actions::put_intervention - erreur", error)
      const message = parseErrorMessage(get(error, 'response.data.message')) || error.message
      this.$toast.error(message)
      throw new Error(message)
    })
  },
  get_mesPiscines({ commit, state }) {
    const url = process.env.API_URL + "/piscine/user/" + state.utilisateurCourant.id;
    log.i("actions::get_mesPiscines - In", { url });
    return this.$axios.$get(url)
      .then(response => {
        log.i("actions::fetched mesPiscines - Done")
        return commit("SET", { key: 'mesPiscines', value: response.mesPiscines });
      })
      .catch(error => {
        log.w("actions::get_mesPiscines - Une erreur est survenue lors de la récupération des piscines de l'utilisateur " + state.utilisateurCourant.id, error);
        return commit('CLEAN', { key: 'mesPiscines' })
      });
  },
  get_maPiscine({ commit, state }, id) {
    const url = process.env.API_URL + "/piscine/" + id;
    log.i("actions::get_maPiscine - In", { url });
    return this.$axios.$get(url)
      .then(response => {
        log.i("actions::fetched maPiscine - Done")
        return commit("SET", { key: 'maPiscine', value: response.maPiscine })
      })
      .catch(error => {
        log.w("actions::get_maPiscine - Une erreur est survenue lors de la récupération d'une piscine de l'utilisateur " + state.utilisateurCourant.id, error)
        return commit("clean_mesPiscines")
      });
  },
  post_maPiscine({ commit, state }, maPiscine) {
    log.i('pactions::post_maPiscine - In')
    maPiscine.utilisateurId = state.utilisateurCourant.id
    const url = process.env.API_URL + "/piscine/"
    return this.$axios.$post(url, { maPiscine }).then(({ maPiscine }) => {
      log.d('pactions::post_maPiscine - Done')
      return commit('UPDATE_ARRAY_ELM', { key: 'mesPiscines', value: maPiscine })
    })
    .catch(error => {
      log.w("actions::post_maPiscine - Une erreur est survenue lors de la récupération d'une piscine de l'utilisateur ", error)
      return commit("clean_mesPiscines")
    });
  },
  set_utilisateur({ commit }, utilisateur) {
    return commit("SET", { key: 'utilisateurCourant', value: utilisateur });
  },
  get_users({ commit, state }) {
    log.i("actions::get_users - In");  
    const url = process.env.API_URL + "/user/";
    return this.$axios.$get(url)
      .then(response => {
        commit("SET", { key: 'users', value: response.users });
        return { users: response.users }
      })
      .catch(error => {
        log.w("actions::get_users - erreur", error);
      });
  },
  get_users_demandes({ commit, state }) {
    log.i("actions::get_users - In");  
    const url = process.env.API_URL + "/user/demandes/";
    return this.$axios.$get(url)
      .then(response => {
        commit("SET", { key: 'users', value: response.users });
        return { users: response.users }
      })
      .catch(error => {
        log.w("actions::get_users_demandes - erreur", error);
      });
  },
  get_user_demandes({ commit,state }, idUtilisateur) {
    log.i("actions::get_user - In");  
    const url = process.env.API_URL + "/user/" + idUtilisateur;
    return this.$axios.$get(url)
      .then(response => {
        log.i("actions::get_user - Done");  
        return commit("SET", { key: 'utilisateurSelectionne', value: response.user });
      })
      .catch(error => {
        log.w("actions::get_user - In", error);
      });
  },
  get_user({ commit,state }, idUtilisateur) {
    log.i("actions::get_user - In");  
    const url = process.env.API_URL + "/user/" + idUtilisateur;
    return this.$axios.$get(url)
      .then(response => {
        log.i("actions::get_user - Done");  
        return commit("SET", { key: 'utilisateurSelectionne', value: response.user });
      })
      .catch(error => {
        log.w("actions::get_user - In", error);
      });
  },
  put_user({ commit, state }, utilisateurSelectionne) {
    log.i("actions::put_user - In");  
    const url = process.env.API_URL + "/user/" + utilisateurSelectionne.id;
    return this.$axios.$put(url, { utilisateurSelectionne })
      .then(({user}) => {
        log.d("actions::put_user - user updated")
        const url = process.env.API_URL + "/user/" + user.id;
        log.d("actions::put_user - get all info about updated user", { url });          
        return this.$axios.$get(url)
          .then(({user}) => {
            log.i("actions::put_user - Done", { user });
            return commit('UPDATE_ARRAY_ELM', { key: 'users', value: user })
          })
      })
      .catch(error => {
        log.w("actions::put_user - erreur", { error });
        return error
      });
  },
  logout({ commit }) {
    return commit("SET", { key: 'utilisateurCourant', value: null });
  },
  get_structureByUser({ commit,state }, userId) {
    log.i("actions::get_structure - In", { userId });  
    const url = process.env.API_URL + "/structures/user/" + userId
    return this.$axios.$get(url)
      .then(response => {
        log.i("actions::get_structure - done")
        return commit("SET", { key: 'structures', value: response.structures });
      })
      .catch(error => {
        log.w("actions::get_structure - erreur", { error }) 
      })
  },
  post_structure({ commit, state }, [structure,userId]) {
    const url  = process.env.API_URL + "/structures";
    log.i("actions::post_structure - In", { url });  
    return this.$axios.$post(url, { structure, userId }).then(({ structure }) => {
      log.i("actions::post_structure - done")
      commit('UPDATE_ARRAY_ELM', { key: 'structures', value: structure })
      return structure
      })
      .catch(error => {
        log.w("actions::post_structure - erreur", { error })
        throw new Error(error.response.data)
      })
  },
  get_documents({ commit }) {
    const url = process.env.API_URL + '/documents'
    log.i("actions::get_documents - In", { url });  
    return this.$axios.get(url).then(response => {
      var documents = response.data
      documents.forEach(doc => {
        delete doc.doc_contenu
      })
      log.i("actions::get_documents - done");
      return commit('SET', { key: 'documents' , value: documents})
    }).catch(err => {
      log.w("actions::get_documents - error", { err });  
    })
    
  },
  login({ commit }, { mail, password }) {
    log.i('actions::login - In', mail)
    const url = process.env.API_URL + "/connexion/pwd-login"
    return this.$axios.$post(url, { mail, password })
      .then(res => {
        const { user, redirect, message } = res
        log.d('login - response from server', user)
        if (!user || !user.id) {
          log.w('login - authserver, user not found')
          throw new Error('Email ou mot de passe incorrect.')
        } else if (redirect) {
          log.i('login - Done but redirect', { user, redirect })
          this.$toast.info(message)
          commit('SET', { key: 'utilisateurCourant', value: user})
          return this.$router.push(redirect)
        } else {
          log.i('login - Done', { user })
          commit('SET', { key: 'utilisateurCourant', value: user })
          return this.$toast.success(`Bienvenue ${user.prenom}`)
        }
      })
      .catch(err => {
        log.w('login - error', err)
        const message = parseErrorMessage(get(err, 'response.data.message') || err.message)
        this.$toast.error(message)
        throw new Error(message)
      })
  },
  register({ commit }, params) {
  params.user.mail = formatEmail(params.user.mail)
    const { mail, password, confirm, role } = params.user
    const connexionType = params.connexionType
    log.i('actions::register - In', mail, password, confirm,role)
    let user = null
    let path = null
    return this.$axios.$post(`${process.env.API_URL}/connexion/create-account-pwd`, { password, mail, confirm, connexionType,role })
      .then(apiRes => {
        user = apiRes.user
        if(apiRes && apiRes.confirmInscription) {
          log.d('actions::register - User not recorded with FC')
          // role = 1 => ADMIN
          // role = 2 => Partenaire
          // role = 3 => formateur
          // role = 4 => MN AQQ
          // role = 5 => MN de base        
          // role = 6 => structure de référence       
          // role = 7 => propriétaire de piscine        
          if (user.role != 1) {
            path = '/connexion/inscription'
          }
          else {
            path = '/interventions'
          }
          commit('SET', { key: 'utilisateurCourant', value: user})
        } else {
          log.d('actions::register - User already use FC')
          // Route pour les Maîtres nagueurs MN
          //path = '/interventions'
          if (user.role == 1) {
            path = '/login'
          }
          else {
            path = '/interventions'
          }
            this.$toast.info(`Un email de confirmation d'inscription vous a été envoyé. Veuillez cliquer sur le lien contenu dans ce mail.`)
        }
        return this.$router.push({ path })
      })
      .catch((err) => {
        log.w('actions::register', err)
        const message = parseErrorMessage(get(err, 'response.data.message')) || err.message
        this.$toast.error(message)
        throw new Error(message)
      })
  },
  forgot_password({ state }, { mail }) {
      log.i('actions::forgot_password - Init', { mail })
      return this.$axios.$post(`${process.env.API_URL}/connexion/forgot-password/${formatEmail(mail)}`)
        .then(res => {
          log.i('actions::forgot_password - Done', res)
        })
        .catch(err => {
          log.w('actions::forgot_password', err)
          const message = parseErrorMessage(get(err, 'response.data.message'))
          throw new Error(message)
        })
  },
  reset_password({ state }, { id, old, password, confirm }) {
    log.i('actions::reset_password - in ', { id, old, password, confirm })
    return this.$axios.$post(`${process.env.API_URL}/connexion/reset-password/`,{ id, old, password, confirm })
      .then(res => {
        log.i('actions::forgot_password - Done', res)
      })
      .catch(err => {
        log.w('actions::forgot_password', err)
        const message = parseErrorMessage(get(err, 'response.data.message'))
        throw new Error(message)
      })
  },
  set_state_element({ commit }, {key,value }) {
    log.i('actions::set_state_element - In',{key , value} )
    return commit('SET', { key, value })
  }
};

export const getters = {
  primaryColor: () => "#4546A1"
}