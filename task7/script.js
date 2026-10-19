(function () {
  'use strict';

  const API_URL = 'https://jsonplaceholder.typicode.com/posts';
  const PORTION_SIZE = 10;
  const SCROLL_GAP = 200;
  const DEBOUNCE_DELAY = 300;

  const Model = {
    posts: [],
    page: 0,
    isLoading: false,
    hasMore: true,

    async loadPortion() {
      this.isLoading = true;
      this.page += 1;
      try {
        const url = API_URL + '?_page=' + this.page + '&_limit=' + PORTION_SIZE;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('сервер вернул статус ' + response.status);
        }
        const portion = await response.json();
        if (portion.length < PORTION_SIZE) {
          this.hasMore = false;
        }
        this.posts = this.posts.concat(portion);
        return portion;
      } catch (error) {
        this.page -= 1;
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    getFilteredPosts(query) {
      const q = query.trim().toLowerCase();
      if (q === '') {
        return this.posts;
      }
      return this.posts.filter(function (post) {
        return post.title.toLowerCase().includes(q);
      });
    }
  };

  const View = {
    listEl: null,
    loaderEl: null,
    errorEl: null,
    endEl: null,
    emptyEl: null,
    searchEl: null,

    init() {
      this.listEl   = document.getElementById('posts-list');
      this.loaderEl = document.getElementById('loader');
      this.errorEl  = document.getElementById('error-message');
      this.endEl    = document.getElementById('end-message');
      this.emptyEl  = document.getElementById('empty-message');
      this.searchEl = document.getElementById('search-input');
    },

    getQuery() {
      return this.searchEl.value;
    },

    renderPosts(posts, query) {
      const html = posts.map((post) => `
        <article class="post-card">
          <h2 class="post-title">${this.escapeHtml(post.title)}</h2>
          <p class="post-body">${this.escapeHtml(post.body)}</p>
          <span class="post-author">id автора: ${post.userId}</span>
        </article>`).join('');
      this.listEl.innerHTML = html;

      const nothingFound = posts.length === 0 && query.trim() !== '';
      this.emptyEl.classList.toggle('hidden', !nothingFound);
    },

    showLoader() { this.loaderEl.classList.remove('hidden'); },
    hideLoader() { this.loaderEl.classList.add('hidden'); },
    showEnd()    { this.endEl.classList.remove('hidden'); },

    showError(text) {
      this.errorEl.textContent = text;
      this.errorEl.classList.remove('hidden');
    },
    hideError() { this.errorEl.classList.add('hidden'); },

    escapeHtml(text) {
      return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }
  };

  const Controller = {
    searchTimerId: null,

    init() {
      View.init();

      View.searchEl.addEventListener('input', () => {
        clearTimeout(this.searchTimerId);
        this.searchTimerId = setTimeout(() => {
          this.renderList();
        }, DEBOUNCE_DELAY);
      });

      window.addEventListener('scroll', () => {
        this.onScroll();
      });

      this.loadMore();
    },

    onScroll() {
      const doc = document.documentElement;
      const distanceToEnd = doc.scrollHeight - (window.scrollY + window.innerHeight);
      if (distanceToEnd <= SCROLL_GAP) {
        this.loadMore();
      }
    },

    async loadMore() {
      if (Model.isLoading || !Model.hasMore) {
        return;
      }
      View.hideError();
      View.showLoader();
      try {
        await Model.loadPortion();
        this.renderList();
        if (!Model.hasMore) {
          View.showEnd();
        }
      } catch (error) {
        View.showError('Не удалось загрузить посты: ' + error.message +
          '. Пролистайте вниз ещё раз — будет повторная попытка.');
      } finally {
        View.hideLoader();
      }
    },

    renderList() {
      const query = View.getQuery();
      View.renderPosts(Model.getFilteredPosts(query), query);
    }
  };

  Controller.init();
})();