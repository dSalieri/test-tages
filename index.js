/// wrapped into IIEF
(async () => {
  const postsPromise = fetchData('https://jsonplaceholder.typicode.com/posts');
  const usersPromise = fetchData('https://jsonplaceholder.typicode.com/users');
  const [posts, users] = await Promise.all([postsPromise, usersPromise]);

  const formatedUsers = formateUsersData(posts, users, {
    address: (data) => {
      const { city, street, suite } = data;
      return `${city}, ${street}, ${suite}`;
    },
    website: (data) => `https://${data}`,
    company: (data) => data.name,
    posts: (data) => {
      const { user, posts } = data;
      return posts.reduce((acc, post) => {
        if (user.id === post.userId) {
          const { id, title, body } = post;
          const title_corp = `${title.slice(0, 20)}...`;
          acc.push({ id, title, title_corp, body });
        }
        return acc;
      }, []);
    },
  });
  const usersWithPostComments = await addCommentsToUserPosts(formatedUsers, 'Ervin Howell');

  console.log(usersWithPostComments);
})();

function formateUsersData(posts, users, rules) {
  return users.reduce((acc, user) => {
    const editedData = {};
    Object.keys(rules).forEach((keyName) => {
      editedData[keyName] = user[keyName] ? rules[keyName](user[keyName]) : rules[keyName]({ user, posts });
    });
    return acc.push({ ...user, ...editedData }), acc;
  }, []);
}

async function addCommentsToUserPosts(users, name) {
  return Promise.all(
    users.map(async (user) => {
      if (user.name === name) {
        if (Array.isArray(user.posts)) {
          const posts = await Promise.all(
            user.posts.map(async (post) => {
              const commentsData = await fetchData(`https://jsonplaceholder.typicode.com/posts/${post.id}/comments`);
              const comments = commentsData.map((comment) => omit(comment, 'postId'));
              return { ...post, comments };
            })
          );
          return { ...user, posts };
        }
      }
      return user;
    })
  );
}

async function fetchData(url, params) {
  const response = await fetch(url.toString(), params);
  if (response.ok) {
    return response.json();
  }
}

function omit(obj, ...fields) {
  const list = new Set(fields);
  return Object.entries(obj).reduce((acc, { 0: propName, 1: value }) => {
    if (!list.has(propName)) acc[propName] = value;
    return acc;
  }, {});
}
