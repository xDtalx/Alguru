import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Post, ClientPost } from './post.model';
import { Comment, ClientComment } from './comment.model';
import { Vote } from './vote.model';

const BACKEND_URL = environment.apiUrl + '/forum';

@Injectable({ providedIn: 'root' })
export class ForumService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<Post[]>();

  constructor(private http: HttpClient) {}

  vote(comment: Comment, vote: Vote) {
    this.http
      .patch<{ message: string; comment: any }>(`${BACKEND_URL}/${comment.postId}/${comment.id}`, vote)
      .subscribe((response) => {
        comment.votes.set(vote.username, vote);
      });
  }

  deletePost(postId: string, postIndex: number) {
    this.http.delete<{ message: string }>(`${BACKEND_URL}/${postId}`).subscribe(() => {
      this.posts.splice(postIndex, 1);
      this.postsUpdated.next([...this.posts]);
    });
  }

  deleteComment(post: Post, comment: Comment) {
    this.http.delete<{ message: string }>(`${BACKEND_URL}/${comment.postId}/${comment.id}`).subscribe(() => {
      const postIndex = this.posts.indexOf(post);
      const commentToDeleteIndex = this.posts[postIndex].comments.indexOf(comment);
      this.posts[postIndex].comments.splice(commentToDeleteIndex, 1);
      this.postsUpdated.next([...this.posts]);
    });
  }

  updateComment(updatedComment: Comment) {
    this.http
      .put<{ message: string; comment: any }>(
        `${BACKEND_URL}/${updatedComment.postId}/${updatedComment.id}`,
        updatedComment
      )
      .subscribe((response) => {
        updatedComment.dates = response.comment.dates;
        updatedComment.titles = response.comment.titles;
        updatedComment.contents = response.comment.contents;
      });
  }

  addComment(selectedPost: Post, commentToAdd: Comment) {
    this.http
      .post<{ message: string; comment: any }>(BACKEND_URL + '/' + selectedPost.id, commentToAdd)
      .subscribe((response) => {
        const comment: ClientComment = {
          id: response.comment._id,
          currentTitle: response.comment.titles[response.comment.titles.length - 1],
          currentContent: response.comment.contents[response.comment.contents.length - 1],
          currentDate: response.comment.dates[response.comment.dates.length - 1],
          titles: response.comment.titles,
          contents: response.comment.contents,
          postId: response.comment.postId,
          author: response.comment.author,
          dates: response.comment.dates,
          onEditPostMode: false,
          showEdits: false,
          votes: new Map<string, Vote>()
        };

        selectedPost.comments.push(comment);
      });
  }

  updatePost(post: Post, oldPost: Post) {
    this.http.put<{ message: string; post: any }>(BACKEND_URL + '/' + post.id, post).subscribe((responseData) => {
      oldPost.comments = responseData.post.comments.map((comment) => {
        return {
          id: comment._id,
          postId: comment.postId,
          currentTitle: comment.currentTitle,
          currentContent: comment.currentContent,
          currentDate: comment.currentDate,
          titles: comment.titles,
          contents: comment.contents,
          author: comment.author,
          dates: comment.dates,
          votes: new Map<string, Vote>(Object.keys(comment.votes).map((key) => this.mapVotes(key, comment)))
        };
      });
      oldPost.contents = responseData.post.contents;
      oldPost.dates = responseData.post.dates;
      oldPost.titles = responseData.post.titles;
      oldPost.currentDate = responseData.post.currentDate;
      oldPost.currentContent = responseData.post.currentContent;
      oldPost.currentTitle = responseData.post.currentTitle;
      this.postsUpdated.next([...this.posts]);
    });
  }

  getPostsUpdatedListener() {
    return this.postsUpdated.asObservable();
  }

  getPosts() {
    this.http
      .get<any>(BACKEND_URL)
      .pipe(
        map((posts) => {
          return posts.map((post) => {
            return {
              id: post._id,
              currentTitle: post.currentTitle,
              currentContent: post.currentContent,
              currentDate: post.currentDate,
              titles: post.titles,
              contents: post.contents,
              author: post.author,
              comments: post.comments.map((comment) => {
                return {
                  id: comment._id,
                  postId: comment.postId,
                  currentTitle: comment.currentTitle,
                  currentContent: comment.currentContent,
                  currentDate: comment.currentDate,
                  titles: comment.titles,
                  contents: comment.contents,
                  author: comment.author,
                  dates: comment.dates,
                  votes: new Map<string, Vote>(Object.keys(comment.votes).map((key) => this.mapVotes(key, comment)))
                };
              }),
              dates: post.dates
            };
          });
        })
      )
      .subscribe((posts) => {
        this.posts = posts;
        this.postsUpdated.next([...this.posts]);
      });
  }

  mapVotes(voteKey, comment): [string, Vote] {
    return [
      voteKey,
      {
        id: comment.votes[voteKey]._id,
        username: comment.votes[voteKey].username,
        isUp: comment.votes[voteKey].isUp
      }
    ];
  }

  addPost(post: Post) {
    this.http.post<{ message: string; post: any }>(BACKEND_URL, post).subscribe((response) => {
      const post: ClientPost = {
        id: response.post._id,
        currentTitle: response.post.titles[response.post.titles.length - 1],
        currentContent: response.post.contents[response.post.contents.length - 1],
        currentDate: response.post.dates[response.post.dates.length - 1],
        titles: response.post.titles,
        contents: response.post.contents,
        author: response.post.author,
        dates: response.post.dates,
        comments: response.post.comments,
        onEditPostMode: false,
        showEdits: false
      };

      this.posts.push(post);
      this.postsUpdated.next([...this.posts]);
    });
  }
}
