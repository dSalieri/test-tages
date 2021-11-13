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
  const comments = await receiveCommentsForUserPosts(formatedUsers, 'Ervin Howell');
  const result = addCommentsToUserPosts(formatedUsers, comments, 'Ervin Howell');
  console.log(result);
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

function addCommentsToUserPosts(users, comments, name) {
  const user = users.find((user) => user.name === name);
  const modifiedPosts = user.posts.reduce((acc, post) => {
    comments.some((commentsId) => {
      if (commentsId.postId === post.id) {
        acc.push({ ...post, comments: commentsId.comments });
        return true;
      }
    });
    return acc;
  }, []);
  return users.reduce((acc, user) => {
    user.name === name ? acc.push({ ...user, posts: modifiedPosts }) : acc.push({ ...user });
    return acc;
  }, []);
}

async function receiveCommentsForUserPosts(users, name) {
  const user = users.find((user) => user.name === name);
  return Promise.all(
    user.posts.map(async (post) => {
      const postData = await fetchData(`https://jsonplaceholder.typicode.com/posts/${post.id}/comments`);
      const comments = postData.map((comment) => omit(comment, 'postId'));
      return { postId: post.id, comments };
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
