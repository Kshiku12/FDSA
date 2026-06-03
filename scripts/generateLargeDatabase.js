import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const topics = [
  { id: 'arrays', name: 'Arrays & Hashing', prefix: 'Array' },
  { id: 'strings', name: 'Strings', prefix: 'String' },
  { id: 'linkedlists', name: 'Linked Lists', prefix: 'List' },
  { id: 'stacks', name: 'Stacks & Queues', prefix: 'Stack' },
  { id: 'trees', name: 'Trees & BST', prefix: 'Tree' },
  { id: 'graphs', name: 'Graphs', prefix: 'Graph' },
  { id: 'dp', name: 'Dynamic Programming', prefix: 'DP' },
  { id: 'greedy', name: 'Greedy Algorithms', prefix: 'Greedy' },
  { id: 'backtracking', name: 'Backtracking', prefix: 'Backtrack' },
  { id: 'advanced', name: 'Advanced Data Structures', prefix: 'Trie' }
];

const difficulties = ['Easy', 'Medium', 'Hard'];
const companies = ['Google', 'Amazon', 'Microsoft', 'Swiggy', 'Uber', 'Meta', 'Netflix', 'Apple'];

const actions = ['Sum', 'Reverse', 'FindMax', 'FindMin', 'CountElements', 'ContainsDuplicate', 'SearchValue'];
const targets = ['Elements', 'Intervals', 'Subarray', 'Subset', 'Pairs', 'Triplets', 'Duplicates', 'Anagrams', 'Cycles', 'Nodes', 'Leaves', 'Paths', 'Islands', 'Components', 'Palindromes', 'Subsequences', 'Permutations', 'Binary Tree', 'Matrix', 'String Pattern', 'Sum', 'Product'];
const conditions = ['with Minimum Cost', 'in O(N) Time', 'with K Elements', 'using Dynamic Programming', 'with Constraints', 'in Sorted Order', 'without Extra Space', 'under Conditions', 'efficiently', 'with Max Value'];

function getSlug(title) {
  return title.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function getFunctionName(title) {
  const cleanTitle = title.replace(/\d+/g, '').replace(/[^a-zA-Z\s]/g, '').trim();
  const words = cleanTitle.split(/\s+/);
  let name = words[0].toLowerCase();
  for (let i = 1; i < words.length; i++) {
    if (words[i]) {
      name += words[i][0].toUpperCase() + words[i].substring(1).toLowerCase();
    }
  }
  return name;
}

function getLocalMainBlock(funcName, topicId, action, testInput, testOutput) {
  let js = ``;
  let py = ``;
  let cpp = ``;
  let java = ``;
  
  if (topicId === 'linkedlists') {
    js = `// --- Local execution main ---\n// const head = buildList(${testInput});\n// console.log(listToArray(${funcName}(head)));`;
    py = `# --- Local execution main ---\n# if __name__ == "__main__":\n#     sol = Solution()\n#     # Construct head here\n#     # print(sol.${funcName}(head))`;
    cpp = `// --- Local execution main ---\n// int main() {\n//     Solution sol;\n//     // ListNode* head = buildList({...});\n//     // sol.${funcName}(head);\n//     return 0;\n// }`;
    java = `// --- Local execution main ---\n// public static void main(String[] args) {\n//     Solution sol = new Solution();\n//     // sol.${funcName}(head);\n// }`;
  }
  else if (topicId === 'trees') {
    js = `// --- Local execution main ---\n// const root = buildTree(${testInput});\n// console.log(${funcName}(root));`;
    py = `# --- Local execution main ---\n# if __name__ == "__main__":\n#     sol = Solution()\n#     # print(sol.${funcName}(root))`;
    cpp = `// --- Local execution main ---\n// int main() {\n//     Solution sol;\n//     // sol.${funcName}(root);\n//     return 0;\n// }`;
    java = `// --- Local execution main ---\n// public static void main(String[] args) {\n//     Solution sol = new Solution();\n//     // sol.${funcName}(root);\n// }`;
  }
  else {
    const params = testInput.split('\n');
    const param1 = params[0] || '[]';
    const param2 = params[1] || '';
    
    let jsCall = `${funcName}(${param1}${param2 ? ', ' + param2 : ''})`;
    let pyCall = `sol.${funcName}(${param1}${param2 ? ', ' + param2 : ''})`;
    let cppCall = `sol.${funcName}(nums${param2 ? ', ' + param2 : ''})`;
    let javaCall = `sol.${funcName}(nums${param2 ? ', ' + param2 : ''})`;

    js = `// --- Local execution main ---\n// console.log(${jsCall});`;
    py = `# --- Local execution main ---\n# if __name__ == "__main__":\n#     sol = Solution()\n#     print(${pyCall})`;
    cpp = `// --- Local execution main ---\n// int main() {\n//     Solution sol;\n//     vector<int> nums = ${param1.replace(/\[/g, '{').replace(/\]/g, '}')};\n//     sol.${cppCall};\n//     return 0;\n// }`;
    java = `// --- Local execution main ---\n// public static void main(String[] args) {\n//     Solution sol = new Solution();\n//     int[] nums = new int[]${param1.replace(/\[/g, '{').replace(/\]/g, '}')};\n//     sol.${javaCall};\n// }`;
  }

  return { js, py, cpp, java };
}

function getStarterCodeAndSolution(title, funcName, topicId, difficulty, action, testInput, testOutput) {
  let jsParams = 'nums';
  let pyParams = 'self, nums';
  let cppParams = 'vector<int>& nums';
  let javaParams = 'int[] nums';
  
  let pyRet = 'List[int]';
  let cppRet = 'vector<int>';
  let javaRet = 'int[]';
  
  if (topicId === 'linkedlists') {
    jsParams = 'head';
    pyParams = 'self, head';
    cppParams = 'ListNode* head';
    javaParams = 'ListNode head';
    
    if (action === 'max') {
      pyRet = 'int';
      cppRet = 'int';
      javaRet = 'int';
    } else if (action === 'search') {
      jsParams = 'head, target';
      pyParams = 'self, head, target';
      cppParams = 'ListNode* head, int target';
      javaParams = 'ListNode head, int target';
      pyRet = 'bool';
      cppRet = 'bool';
      javaRet = 'boolean';
    } else {
      pyRet = 'Optional[ListNode]';
      cppRet = 'ListNode*';
      javaRet = 'ListNode';
    }
  }
  else if (topicId === 'trees') {
    jsParams = 'root';
    pyParams = 'self, root';
    cppParams = 'TreeNode* root';
    javaParams = 'TreeNode root';
    
    if (action === 'reverse') {
      pyRet = 'Optional[TreeNode]';
      cppRet = 'TreeNode*';
      javaRet = 'TreeNode';
    } else {
      pyRet = 'List[int]';
      cppRet = 'vector<int>';
      javaRet = 'List<Integer>';
    }
  }
  else if (topicId === 'strings') {
    if (action === 'reverse') {
      jsParams = 's';
      pyParams = 'self, s';
      cppParams = 'vector<char>& s';
      javaParams = 'char[] s';
      pyRet = 'List[str]';
      cppRet = 'vector<char>';
      javaRet = 'char[]';
    } else if (action === 'check_duplicates') {
      jsParams = 's';
      pyParams = 'self, s';
      cppParams = 'string s';
      javaParams = 'String s';
      pyRet = 'bool';
      cppRet = 'bool';
      javaRet = 'boolean';
    } else {
      jsParams = 's';
      pyParams = 'self, s';
      cppParams = 'string s';
      javaParams = 'String s';
      pyRet = 'int';
      cppRet = 'int';
      javaRet = 'int';
    }
  }
  else if (topicId === 'graphs') {
    if (action === 'search') {
      jsParams = 'grid';
      pyParams = 'self, grid';
      cppParams = 'vector<vector<char>>& grid';
      javaParams = 'char[][] grid';
      pyRet = 'int';
      cppRet = 'int';
      javaRet = 'int';
    } else {
      jsParams = 'grid';
      pyParams = 'self, grid';
      cppParams = 'vector<vector<int>>& grid';
      javaParams = 'int[][] grid';
      pyRet = 'int';
      cppRet = 'int';
      javaRet = 'int';
    }
  }
  else if (topicId === 'dp' && action === 'sum') {
    jsParams = 'n';
    pyParams = 'self, n';
    cppParams = 'int n';
    javaParams = 'int n';
    pyRet = 'int';
    cppRet = 'int';
    javaRet = 'int';
  }
  else {
    if (action === 'sum' || action === 'max' || action === 'min' || action === 'count') {
      pyRet = 'int';
      cppRet = 'int';
      javaRet = 'int';
    } else if (action === 'check_duplicates') {
      pyRet = 'bool';
      cppRet = 'bool';
      javaRet = 'boolean';
    } else if (action === 'search') {
      jsParams = 'nums, target';
      pyParams = 'self, nums, target';
      cppParams = 'vector<int>& nums, int target';
      javaParams = 'int[] nums, int target';
      pyRet = 'int';
      cppRet = 'int';
      javaRet = 'int';
    } else {
      pyRet = 'List[int]';
      cppRet = 'vector<int>';
      javaRet = 'int[]';
    }
  }

  let pyImports = 'from typing import List, Optional, Dict, Tuple\n\n';
  let cppImports = '#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\nusing namespace std;\n\n';
  let javaImports = 'import java.util.*;\n\n';

  if (topicId === 'linkedlists') {
    const listComment = `// Definition for singly-linked list.\n// struct ListNode {\n//     int val;\n//     ListNode *next;\n//     ListNode(int x) : val(x), next(NULL) {}\n// };\n\n`;
    cppImports += listComment;
    javaImports += listComment;
    pyImports += `# Definition for singly-linked list.\n# class ListNode:\n#     def __init__(self, val=0, next=None):\n#         self.val = val\n#         self.next = next\n\n`;
  }
  else if (topicId === 'trees') {
    const treeComment = `// Definition for a binary tree node.\n// struct TreeNode {\n//     int val;\n//     TreeNode *left;\n//     TreeNode *right;\n//     TreeNode(int x) : val(x), left(NULL), right(NULL) {}\n// };\n\n`;
    cppImports += treeComment;
    javaImports += treeComment;
    pyImports += `# Definition for a binary tree node.\n# class TreeNode:\n#     def __init__(self, val=0, left=None, right=None):\n#         self.val = val\n#         self.left = left\n#         self.right = right\n\n`;
  }

  const localMain = getLocalMainBlock(funcName, topicId, action, testInput, testOutput);

  const starterCode = {
    javascript: `function ${funcName}(${jsParams}) {\n    // Write your code here\n    \n};\n\n${localMain.js}`,
    python: `${pyImports}class Solution:\n    def ${funcName}(${pyParams}):\n        pass\n\n${localMain.py}`,
    cpp: `${cppImports}class Solution {\npublic:\n    ${cppRet} ${funcName}(${cppParams}) {\n        \n    }\n};\n\n${localMain.cpp}`,
    java: `${javaImports}class Solution {\n    public ${javaRet} ${funcName}(${javaParams}) {\n        \n    }\n}\n\n${localMain.java}`
  };

  let solBodyJs = '';
  let solBodyPy = '';
  let solBodyCpp = '';
  let solBodyJava = '';
  let timeComp = 'O(N)';
  let spaceComp = 'O(1)';

  if (title === 'Two Sum' || funcName === 'twoSum') {
    solBodyJs = `    return nums.reduce((a, b) => a + b, 0);`;
    solBodyPy = `        return sum(nums)`;
    solBodyCpp = `        int total = 0;\n        for (int num : nums) total += num;\n        return total;`;
    solBodyJava = `        int total = 0;\n        for (int num : nums) total += num;\n        return total;`;
    timeComp = 'O(N)';
    spaceComp = 'O(1)';
  } else if (title === 'Reverse Linked List' || funcName === 'reverseList') {
    solBodyJs = `    let prev = null;\n    let curr = head;\n    while (curr) {\n        let next = curr.next;\n        curr.next = prev;\n        prev = curr;\n        curr = next;\n    }\n    return prev;`;
    solBodyPy = `        prev = None\n        curr = head\n        while curr:\n            nxt = curr.next\n            curr.next = prev\n            prev = curr\n            curr = nxt\n        return prev`;
    solBodyCpp = `        ListNode* prev = nullptr;\n        ListNode* curr = head;\n        while (curr) {\n            ListNode* next = curr->next;\n            curr->next = prev;\n            prev = curr;\n            curr = next;\n        }\n        return prev;`;
    solBodyJava = `        ListNode prev = null;\n        ListNode curr = head;\n        while (curr != null) {\n            ListNode next = curr.next;\n            curr.next = prev;\n            prev = curr;\n            curr = next;\n        }\n        return prev;`;
    timeComp = 'O(N)';
    spaceComp = 'O(1)';
  } else if (title === 'Climbing Stairs' || funcName === 'climbStairs') {
    solBodyJs = `    if (n <= 2) return n;\n    let first = 1, second = 2;\n    for (let i = 3; i <= n; i++) {\n        let third = first + second;\n        first = second;\n        second = third;\n    }\n    return second;`;
    solBodyPy = `        if n <= 2:\n            return n\n        first, second = 1, 2\n        for i in range(3, n + 1):\n            first, second = second, first + second\n        return second`;
    solBodyCpp = `        if (n <= 2) return n;\n        int first = 1, second = 2;\n        for (int i = 3; i <= n; i++) {\n            int third = first + second;\n            first = second;\n            second = third;\n        }\n        return second;`;
    solBodyJava = `        if (n <= 2) return n;\n        int first = 1, second = 2;\n        for (int i = 3; i <= n; i++) {\n            int third = first + second;\n            first = second;\n            second = third;\n        }\n        return second;`;
    timeComp = 'O(N)';
    spaceComp = 'O(1)';
  } else if (title === 'Binary Tree Inorder Traversal' || funcName === 'inorderTraversal') {
    solBodyJs = `    const res = [];\n    function traverse(node) {\n        if (!node) return;\n        traverse(node.left);\n        res.push(node.val);\n        traverse(node.right);\n    }\n    traverse(root);\n    return res;`;
    solBodyPy = `        res = []\n        def traverse(node):\n            if not node:\n                return\n            traverse(node.left)\n            res.append(node.val)\n            traverse(node.right)\n        traverse(root)\n        return res`;
    solBodyCpp = `        vector<int> res;\n        auto traverse = [&](auto& self, TreeNode* node) -> void {\n            if (!node) return;\n            self(self, node->left);\n            res.push_back(node->val);\n            self(self, node->right);\n        };\n        traverse(traverse, root);\n        return res;`;
    solBodyJava = `        List<Integer> res = new ArrayList<>();\n        Stack<TreeNode> stack = new Stack<>();\n        TreeNode curr = root;\n        while (curr != null || !stack.isEmpty()) {\n            while (curr != null) {\n                stack.push(curr);\n                curr = curr.left;\n            }\n            curr = stack.pop();\n            res.add(curr.val);\n            curr = curr.right;\n        }\n        return res;`;
    timeComp = 'O(N)';
    spaceComp = 'O(N)';
  } else if (title === 'Number of Islands' || funcName === 'numIslands') {
    solBodyJs = `    if (!grid || grid.length === 0) return 0;\n    let count = 0;\n    const rows = grid.length;\n    const cols = grid[0].length;\n    function dfs(r, c) {\n        if (r < 0 || c < 0 || r >= rows || c >= cols || grid[r][c] === '0') return;\n        grid[r][c] = '0';\n        dfs(r + 1, c);\n        dfs(r - 1, c);\n        dfs(r, c + 1);\n        dfs(r, c - 1);\n    }\n    for (let r = 0; r < rows; r++) {\n        for (let c = 0; c < cols; c++) {\n            if (grid[r][c] === '1') {\n                count++;\n                dfs(r, c);\n            }\n        }\n    }\n    return count;`;
    solBodyPy = `        if not grid:\n            return 0\n        count = 0\n        rows, cols = len(grid), len(grid[0])\n        def dfs(r, c):\n            if r < 0 || c < 0 || r >= rows || c >= cols || grid[r][c] == '0':\n                return\n            grid[r][c] = '0'\n            dfs(r + 1, c)\n            dfs(r - 1, c)\n            dfs(r, c + 1)\n            dfs(r, c - 1)\n        for r in range(rows):\n            for c in range(cols):\n                if grid[r][c] == '1':\n                    count += 1\n                    dfs(r, c)\n        return count`;
    solBodyCpp = `        if (grid.empty()) return 0;\n        int count = 0;\n        int rows = grid.size();\n        int cols = grid[0].size();\n        for (int r = 0; r < rows; ++r) {\n            for (int c = 0; c < cols; ++c) {\n                if (grid[r][c] == '1') {\n                    ++count;\n                    vector<pair<int, int>> st;\n                    st.push_back({r, c});\n                    grid[r][c] = '0';\n                    while (!st.empty()) {\n                        auto [currR, currC] = st.back();\n                        st.pop_back();\n                        int dr[] = {-1, 1, 0, 0};\n                        int dc[] = {0, 0, -1, 1};\n                        for (int i = 0; i < 4; ++i) {\n                            int nr = currR + dr[i];\n                            int nc = currC + dc[i];\n                            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] == '1') {\n                                grid[nr][nc] = '0';\n                                st.push_back({nr, nc});\n                            }\n                        }\n                    }\n                }\n            }\n        }\n        return count;`;
    solBodyJava = `        if (grid == null || grid.length == 0) return 0;\n        int count = 0;\n        int rows = grid.length;\n        int cols = grid[0].length;\n        for (int r = 0; r < rows; r++) {\n            for (int c = 0; c < cols; c++) {\n                if (grid[r][c] == '1') {\n                    count++;\n                    Queue<int[]> queue = new LinkedList<>();\n                    queue.offer(new int[]{r, c});\n                    grid[r][c] = '0';\n                    while (!queue.isEmpty()) {\n                        int[] curr = queue.poll();\n                        int currR = curr[0];\n                        int currC = curr[1];\n                        int[] dr = {-1, 1, 0, 0};\n                        int[] dc = {0, 0, -1, 1};\n                        for (int i = 0; i < 4; i++) {\n                            int nr = currR + dr[i];\n                            int nc = currC + dc[i];\n                            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] == '1') {\n                                grid[nr][nc] = '0';\n                                queue.offer(new int[]{nr, nc});\n                            }\n                        }\n                    }\n                }\n            }\n        }\n        return count;`;
    timeComp = 'O(M * N)';
    spaceComp = 'O(M * N)';
  } else {
    if (topicId === 'linkedlists') {
      if (action === 'reverse') {
        solBodyJs = `    let prev = null;\n    let curr = head;\n    while (curr) {\n        let next = curr.next;\n        curr.next = prev;\n        prev = curr;\n        curr = next;\n    }\n    return prev;`;
        solBodyPy = `        prev = None\n        curr = head\n        while curr:\n            nxt = curr.next\n            curr.next = prev\n            prev = curr\n            curr = nxt\n        return prev`;
        solBodyCpp = `        ListNode* prev = nullptr;\n        ListNode* curr = head;\n        while (curr) {\n            ListNode* next = curr->next;\n            curr->next = prev;\n            prev = curr;\n            curr = next;\n        }\n        return prev;`;
        solBodyJava = `        ListNode prev = null;\n        ListNode curr = head;\n        while (curr != null) {\n            ListNode next = curr.next;\n            curr.next = prev;\n            prev = curr;\n            curr = next;\n        }\n        return prev;`;
      } else if (action === 'search') {
        solBodyJs = `    let curr = head;\n    while (curr) {\n        if (curr.val === target) return true;\n        curr = curr.next;\n    }\n    return false;`;
        solBodyPy = `        curr = head\n        while curr:\n            if curr.val == target:\n                return True\n            curr = curr.next\n        return False`;
        solBodyCpp = `        ListNode* curr = head;\n        while (curr) {\n            if (curr->val == target) return true;\n            curr = curr->next;\n        }\n        return false;`;
        solBodyJava = `        ListNode curr = head;\n        while (curr != null) {\n            if (curr.val == target) return true;\n            curr = curr.next;\n        }\n        return false;`;
      } else {
        solBodyJs = `    let maxVal = -Infinity;\n    let curr = head;\n    while (curr) {\n        maxVal = Math.max(maxVal, curr.val);\n        curr = curr.next;\n    }\n    return maxVal;`;
        solBodyPy = `        max_val = float('-inf')\n        curr = head\n        while curr:\n            max_val = max(max_val, curr.val)\n            curr = curr.next\n        return max_val`;
        solBodyCpp = `        int maxVal = -2147483648;\n        ListNode* curr = head;\n        while (curr) {\n            maxVal = max(maxVal, curr->val);\n            curr = curr->next;\n        }\n        return maxVal;`;
        solBodyJava = `        int maxVal = Integer.MIN_VALUE;\n        ListNode curr = head;\n        while (curr != null) {\n            maxVal = Math.max(maxVal, curr.val);\n            curr = curr.next;\n        }\n        return maxVal;`;
      }
    } else if (topicId === 'trees') {
      if (action === 'reverse') {
        solBodyJs = `    if (!root) return null;\n    let temp = root.left;\n    root.left = ${funcName}(root.right);\n    root.right = ${funcName}(temp);\n    return root;`;
        solBodyPy = `        if not root:\n            return None\n        root.left, root.right = self.${funcName}(root.right), self.${funcName}(root.left)\n        return root`;
        solBodyCpp = `        if (!root) return nullptr;\n        TreeNode* temp = root->left;\n        root->left = ${funcName}(root->right);\n        root->right = ${funcName}(temp);\n        return root;`;
        solBodyJava = `        if (root == null) return null;\n        TreeNode temp = root.left;\n        root.left = ${funcName}(root.right);\n        root.right = ${funcName}(temp);\n        return root;`;
      } else {
        solBodyJs = `    const res = [];\n    function traverse(node) {\n        if (!node) return;\n        traverse(node.left);\n        res.push(node.val);\n        traverse(node.right);\n    }\n    traverse(root);\n    return res;`;
        solBodyPy = `        res = []\n        def traverse(node):\n            if not node:\n                return\n            traverse(node.left)\n            res.append(node.val)\n            traverse(node.right)\n        traverse(root)\n        return res`;
        solBodyCpp = `        vector<int> res;\n        auto traverse = [&](auto& self, TreeNode* node) -> void {\n            if (!node) return;\n            self(self, node->left);\n            res.push_back(node->val);\n            self(self, node->right);\n        };\n        traverse(traverse, root);\n        return res;`;
        solBodyJava = `        List<Integer> res = new ArrayList<>();\n        Stack<TreeNode> stack = new Stack<>();\n        TreeNode curr = root;\n        while (curr != null || !stack.isEmpty()) {\n            while (curr != null) {\n                stack.push(curr);\n                curr = curr.left;\n            }\n            curr = stack.pop();\n            res.add(curr.val);\n            curr = curr.right;\n        }\n        return res;`;
      }
    } else if (topicId === 'strings') {
      if (action === 'reverse') {
        solBodyJs = `    return s.reverse();`;
        solBodyPy = `        return s[::-1]`;
        solBodyCpp = `        vector<char> res = s;\n        reverse(res.begin(), res.end());\n        return res;`;
        solBodyJava = `        char[] res = s.clone();\n        int left = 0, right = res.length - 1;\n        while (left < right) {\n            char temp = res[left];\n            res[left] = res[right];\n            res[right] = temp;\n            left++;\n            right--;\n        }\n        return res;`;
      } else if (action === 'check_duplicates') {
        solBodyJs = `    return new Set(s).size !== s.length;`;
        solBodyPy = `        return len(set(s)) != len(s)`;
        solBodyCpp = `        unordered_map<char, int> counts;\n        for (char c : s) {\n            if (++counts[c] > 1) return true;\n        }\n        return false;`;
        solBodyJava = `        Set<Character> seen = new HashSet<>();\n        for (char c : s.toCharArray()) {\n            if (!seen.add(c)) return true;\n        }\n        return false;`;
      } else {
        solBodyJs = `    return s.length;`;
        solBodyPy = `        return len(s)`;
        solBodyCpp = `        return s.length();`;
        solBodyJava = `        return s.length();`;
      }
    } else if (topicId === 'graphs') {
      if (action === 'search') {
        solBodyJs = `    if (!grid || grid.length === 0) return 0;\n    let count = 0;\n    const rows = grid.length;\n    const cols = grid[0].length;\n    function dfs(r, c) {\n        if (r < 0 || c < 0 || r >= rows || c >= cols || grid[r][c] === '0') return;\n        grid[r][c] = '0';\n        dfs(r + 1, c);\n        dfs(r - 1, c);\n        dfs(r, c + 1);\n        dfs(r, c - 1);\n    }\n    for (let r = 0; r < rows; r++) {\n        for (let c = 0; c < cols; c++) {\n            if (grid[r][c] === '1') {\n                count++;\n                dfs(r, c);\n            }\n        }\n    }\n    return count;`;
        solBodyPy = `        if not grid:\n            return 0\n        count = 0\n        rows, cols = len(grid), len(grid[0])\n        def dfs(r, c):\n            if r < 0 or c < 0 or r >= rows or c >= cols or grid[r][c] == '0':\n                return\n            grid[r][c] = '0'\n            dfs(r + 1, c)\n            dfs(r - 1, c)\n            dfs(r, c + 1)\n            dfs(r, c - 1)\n        for r in range(rows):\n            for c in range(cols):\n                if grid[r][c] == '1':\n                    count += 1\n                    dfs(r, c)\n        return count`;
        solBodyCpp = `        if (grid.empty()) return 0;\n        int count = 0;\n        int rows = grid.size();\n        int cols = grid[0].size();\n        for (int r = 0; r < rows; ++r) {\n            for (int c = 0; c < cols; ++c) {\n                if (grid[r][c] == '1') {\n                    ++count;\n                    vector<pair<int, int>> st;\n                    st.push_back({r, c});\n                    grid[r][c] = '0';\n                    while (!st.empty()) {\n                        auto [currR, currC] = st.back();\n                        st.pop_back();\n                        int dr[] = {-1, 1, 0, 0};\n                        int dc[] = {0, 0, -1, 1};\n                        for (int i = 0; i < 4; ++i) {\n                            int nr = currR + dr[i];\n                            int nc = currC + dc[i];\n                            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] == '1') {\n                                grid[nr][nc] = '0';\n                                st.push_back({nr, nc});\n                            }\n                        }\n                    }\n                }\n            }\n        }\n        return count;`;
        solBodyJava = `        if (grid == null || grid.length == 0) return 0;\n        int count = 0;\n        int rows = grid.length;\n        int cols = grid[0].length;\n        for (int r = 0; r < rows; r++) {\n            for (int c = 0; c < cols; c++) {\n                if (grid[r][c] == '1') {\n                    count++;\n                    Queue<int[]> queue = new LinkedList<>();\n                    queue.offer(new int[]{r, c});\n                    grid[r][c] = '0';\n                    while (!queue.isEmpty()) {\n                        int[] curr = queue.poll();\n                        int currR = curr[0];\n                        int currC = curr[1];\n                        int[] dr = {-1, 1, 0, 0};\n                        int[] dc = {0, 0, -1, 1};\n                        for (int i = 0; i < 4; i++) {\n                            int nr = currR + dr[i];\n                            int nc = currC + dc[i];\n                            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] == '1') {\n                                grid[nr][nc] = '0';\n                                queue.offer(new int[]{nr, nc});\n                            }\n                        }\n                    }\n                }\n            }\n        }\n        return count;`;
      } else {
        solBodyJs = `    return grid.length;`;
        solBodyPy = `        return len(grid)`;
        solBodyCpp = `        return grid.size();`;
        solBodyJava = `        return grid.length;`;
      }
    } else {
      if (action === 'sum') {
        solBodyJs = `    return nums.reduce((a, b) => a + b, 0);`;
        solBodyPy = `        return sum(nums)`;
        solBodyCpp = `        int total = 0;\n        for (int num : nums) total += num;\n        return total;`;
        solBodyJava = `        int total = 0;\n        for (int num : nums) total += num;\n        return total;`;
      } else if (action === 'max') {
        solBodyJs = `    return Math.max(...nums);`;
        solBodyPy = `        return max(nums) if nums else 0`;
        solBodyCpp = `        if (nums.empty()) return 0;\n        return *max_element(nums.begin(), nums.end());`;
        solBodyJava = `        if (nums.length == 0) return 0;\n        int maxVal = nums[0];\n        for (int num : nums) {\n            if (num > maxVal) maxVal = num;\n        }\n        return maxVal;`;
      } else if (action === 'min') {
        solBodyJs = `    return Math.min(...nums);`;
        solBodyPy = `        return min(nums) if nums else 0`;
        solBodyCpp = `        if (nums.empty()) return 0;\n        return *min_element(nums.begin(), nums.end());`;
        solBodyJava = `        if (nums.length == 0) return 0;\n        int minVal = nums[0];\n        for (int num : nums) {\n            if (num < minVal) minVal = num;\n        }\n        return minVal;`;
      } else if (action === 'count') {
        solBodyJs = `    return nums.length;`;
        solBodyPy = `        return len(nums)`;
        solBodyCpp = `        return nums.size();`;
        solBodyJava = `        return nums.length;`;
      } else if (action === 'check_duplicates') {
        solBodyJs = `    return new Set(nums).size !== nums.length;`;
        solBodyPy = `        return len(set(nums)) != len(nums)`;
        solBodyCpp = `        unordered_map<int, int> seen;\n        for (int num : nums) {\n            if (++seen[num] > 1) return true;\n        }\n        return false;`;
        solBodyJava = `        Set<Integer> seen = new HashSet<>();\n        for (int num : nums) {\n            if (!seen.add(num)) return true;\n        }\n        return false;`;
      } else if (action === 'search') {
        solBodyJs = `    return nums.indexOf(target);`;
        solBodyPy = `        try:\n            return nums.index(target)\n        except ValueError:\n            return -1`;
        solBodyCpp = `        for (int i = 0; i < nums.size(); i++) {\n            if (nums[i] == target) return i;\n        }\n        return -1;`;
        solBodyJava = `        for (int i = 0; i < nums.length; i++) {\n            if (nums[i] == target) return i;\n        }\n        return -1;`;
      } else {
        solBodyJs = `    return nums.reverse();`;
        solBodyPy = `        return nums[::-1]`;
        solBodyCpp = `        vector<int> res = nums;\n        reverse(res.begin(), res.end());\n        return res;`;
        solBodyJava = `        int[] res = nums.clone();\n        int left = 0, right = res.length - 1;\n        while (left < right) {\n            int temp = res[left];\n            res[left] = res[right];\n            res[right] = temp;\n            left++;\n            right--;\n        }\n        return res;`;
      }
    }
  }

  let solCode = `function ${funcName}(${jsParams}) {\n${solBodyJs}\n};\n\n${localMain.js}`;
  let solCodePy = `${pyImports}class Solution:\n    def ${funcName}(${pyParams}):\n${solBodyPy}\n\n${localMain.py}`;
  let solCodeCpp = `${cppImports}class Solution {\npublic:\n    ${cppRet} ${funcName}(${cppParams}) {\n${solBodyCpp}\n    }\n};\n\n${localMain.cpp}`;
  let solCodeJava = `${javaImports}class Solution {\n    public ${javaRet} ${funcName}(${javaParams}) {\n${solBodyJava}\n    }\n}\n\n${localMain.java}`;

  const solution = {
    intuition: `To solve "${title}", we optimize the calculation using direct traversal or pointers. This is a classic placement problem.`,
    algorithm: `1. Setup pointers or tracking states.\n2. Iterate through elements.\n3. Return result.`,
    complexity: {
      time: timeComp,
      space: spaceComp
    },
    code: {
      javascript: solCode,
      python: solCodePy,
      cpp: solCodeCpp,
      java: solCodeJava
    },
    youtubeUrl: `https://www.youtube.com/results?search_query=neetcode+striver+${encodeURIComponent(title)}+solution`
  };

  return { starterCode, solution };
}

function getLogicAndOutput(title, topicId) {
  let action = 'sum';
  if (title.includes('Reverse') || title.includes('Invert') || title.includes('Flip')) {
    action = 'reverse';
  } else if (title.includes('Max') || title.includes('Largest') || title.includes('Peak')) {
    action = 'max';
  } else if (title.includes('Min') || title.includes('Smallest')) {
    action = 'min';
  } else if (title.includes('Count') || title.includes('Length') || title.includes('Size')) {
    action = 'count';
  } else if (title.includes('Check') || title.includes('Validate') || title.includes('Contains') || title.includes('Has')) {
    action = 'check_duplicates';
  } else if (title.includes('Search') || title.includes('Find') || title.includes('Index')) {
    action = 'search';
  }

  const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const randomArray = (length, min, max) => Array.from({ length }, () => randomInt(min, max));
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  const randomString = (length) => Array.from({ length }, () => chars[randomInt(0, chars.length - 1)]).join('');
  const randomTreeArray = (size) => {
      const arr = [randomInt(1, 100)];
      for (let i = 1; i < size; i++) {
          arr.push(Math.random() > 0.2 ? randomInt(1, 100) : null);
      }
      while (arr.length > 0 && arr[arr.length - 1] === null) {
          arr.pop();
      }
      if (arr.length === 0) return [1];
      return arr;
  };
  const randomGrid = (rows, cols) => {
      const grid = [];
      for (let r = 0; r < rows; r++) {
          const row = [];
          for (let c = 0; c < cols; c++) {
              row.push(Math.random() > 0.6 ? '1' : '0');
          }
          grid.push(row);
      }
      return grid;
  };

  function buildTree(arr) {
    if (!arr || arr.length === 0 || arr[0] === null) return null;
    const root = { val: arr[0], left: null, right: null };
    const queue = [root];
    let i = 1;
    while (queue.length > 0 && i < arr.length) {
      const curr = queue.shift();
      if (arr[i] !== null && arr[i] !== undefined) {
        curr.left = { val: arr[i], left: null, right: null };
        queue.push(curr.left);
      }
      i++;
      if (i < arr.length && arr[i] !== null && arr[i] !== undefined) {
        curr.right = { val: arr[i], left: null, right: null };
        queue.push(curr.right);
      }
      i++;
    }
    return root;
  }
  function invertTree(root) {
    if (!root) return null;
    const temp = root.left;
    root.left = invertTree(root.right);
    root.right = invertTree(temp);
    return root;
  }
  function treeToArray(root) {
    if (!root) return [];
    const res = [];
    const queue = [root];
    while (queue.length > 0) {
      const curr = queue.shift();
      if (curr) {
        res.push(curr.val);
        queue.push(curr.left);
        queue.push(curr.right);
      } else {
        res.push(null);
      }
    }
    while (res.length > 0 && res[res.length - 1] === null) {
      res.pop();
    }
    return res;
  }
  function inorderTraversal(root) {
      const res = [];
      function traverse(node) {
          if (!node) return;
          traverse(node.left);
          res.push(node.val);
          traverse(node.right);
      }
      traverse(root);
      return res;
  }
  function solveNumIslands(grid) {
    if (!grid || grid.length === 0) return 0;
    let count = 0;
    const rows = grid.length;
    const cols = grid[0].length;
    const tempGrid = JSON.parse(JSON.stringify(grid));
    function dfs(r, c) {
      if (r < 0 || c < 0 || r >= rows || c >= cols || tempGrid[r][c] === '0') return;
      tempGrid[r][c] = '0';
      dfs(r + 1, c);
      dfs(r - 1, c);
      dfs(r, c + 1);
      dfs(r, c - 1);
    }
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (tempGrid[r][c] === '1') {
          count++;
          dfs(r, c);
        }
      }
    }
    return count;
  }
  function climbStairs(n) {
      if (n <= 2) return n;
      let first = 1, second = 2;
      for (let i = 3; i <= n; i++) {
          let third = first + second;
          first = second;
          second = third;
      }
      return second;
  }

  let exampleInput = '';
  let exampleOutput = '';
  let desc = '';
  let constraints = [];
  const testCases = [];

  if (topicId === 'linkedlists') {
    const testArr = [1, 2, 3, 4, 5];
    const exArr = [1, 2, 3];
    
    if (action === 'reverse') {
      desc = `Given the head of a singly linked list, reverse the list, and return the reversed list.`;
      exampleInput = `head = ${JSON.stringify(exArr)}`;
      exampleOutput = JSON.stringify([...exArr].reverse());
      testCases.push({ input: JSON.stringify(testArr), output: JSON.stringify([...testArr].reverse()) });
      testCases.push({ input: JSON.stringify([1, 2]), output: JSON.stringify([2, 1]) });
      testCases.push({ input: JSON.stringify([]), output: JSON.stringify([]) });
      for (let t = 0; t < 12; t++) {
          const len = randomInt(1, 10);
          const arr = randomArray(len, 1, 100);
          testCases.push({ input: JSON.stringify(arr), output: JSON.stringify([...arr].reverse()) });
      }
    } else if (action === 'search') {
      desc = `Given the head of a singly linked list, process and return the modified list structure.`;
      exampleInput = `head = ${JSON.stringify(exArr)}, target = 3`;
      exampleOutput = 'true';
      testCases.push({ input: `${JSON.stringify(testArr)}\n3`, output: 'true' });
      testCases.push({ input: `${JSON.stringify(testArr)}\n6`, output: 'false' });
      for (let t = 0; t < 13; t++) {
          const len = randomInt(1, 10);
          const arr = randomArray(len, 1, 20);
          const target = Math.random() > 0.5 ? arr[randomInt(0, len - 1)] : randomInt(21, 40);
          testCases.push({ input: `${JSON.stringify(arr)}\n${target}`, output: String(arr.includes(target)) });
      }
    } else {
      desc = `Given the head of a singly linked list, return the node with the maximum value in the list.`;
      exampleInput = `head = ${JSON.stringify(exArr)}`;
      exampleOutput = String(Math.max(...exArr));
      testCases.push({ input: JSON.stringify(testArr), output: String(Math.max(...testArr)) });
      for (let t = 0; t < 14; t++) {
          const len = randomInt(1, 10);
          const arr = randomArray(len, -100, 100);
          testCases.push({ input: JSON.stringify(arr), output: String(Math.max(...arr)) });
      }
    }
    constraints = ["The number of nodes in the list is in the range [0, 5000].", "-5000 <= Node.val <= 5000"];
  }
  else if (topicId === 'trees') {
    const testArr = [1, 2, 3, null, 4];
    const exArr = [1, null, 2];
    
    if (action === 'reverse') {
      desc = `Given the root of a binary tree, invert the tree (mirror it left-to-right), and return its root.`;
      exampleInput = `root = ${JSON.stringify(exArr)}`;
      exampleOutput = JSON.stringify([1, 2]);
      testCases.push({ input: JSON.stringify(testArr), output: JSON.stringify([1, 3, 2, 4]) });
      for (let t = 0; t < 14; t++) {
          const arr = randomTreeArray(randomInt(3, 10));
          const root = buildTree(arr);
          const invertedRoot = invertTree(root);
          const outArr = treeToArray(invertedRoot);
          testCases.push({ input: JSON.stringify(arr), output: JSON.stringify(outArr) });
      }
    } else {
      desc = `Given the root of a binary tree, perform a traversal and return the traversal order of the node values.`;
      exampleInput = `root = [1, null, 2, 3]`;
      exampleOutput = `[1, 3, 2]`;
      testCases.push({ input: JSON.stringify([1, 2, 3]), output: JSON.stringify([2, 1, 3]) });
      for (let t = 0; t < 14; t++) {
          const arr = randomTreeArray(randomInt(3, 10));
          const root = buildTree(arr);
          const inorder = inorderTraversal(root);
          testCases.push({ input: JSON.stringify(arr), output: JSON.stringify(inorder) });
      }
    }
    constraints = ["The number of nodes in the tree is in the range [0, 100].", "-100 <= Node.val <= 100"];
  }
  else if (topicId === 'strings') {
    const testStr = "hello";
    const exStr = "aba";
    
    if (action === 'reverse') {
      desc = `Write a function that reverses a string. The input string is given as an array of characters.`;
      exampleInput = `s = ${JSON.stringify(exStr.split(''))}`;
      exampleOutput = JSON.stringify(exStr.split('').reverse());
      testCases.push({ input: JSON.stringify(testStr.split('')), output: JSON.stringify(testStr.split('').reverse()) });
      for (let t = 0; t < 14; t++) {
          const s = randomString(randomInt(1, 10));
          testCases.push({ input: JSON.stringify(s.split('')), output: JSON.stringify(s.split('').reverse()) });
      }
    } else if (action === 'check_duplicates') {
      desc = `Given a string, check if it contains duplicate characters.`;
      exampleInput = `s = "${exStr}"`;
      exampleOutput = String(new Set(exStr).size !== exStr.length);
      testCases.push({ input: JSON.stringify(testStr), output: String(new Set(testStr).size !== testStr.length) });
      testCases.push({ input: JSON.stringify("abc"), output: "false" });
      for (let t = 0; t < 13; t++) {
          const s = Math.random() > 0.5 ? randomString(randomInt(3, 10)) : "abcde".substring(0, randomInt(2, 5));
          const hasDup = new Set(s).size !== s.length;
          testCases.push({ input: JSON.stringify(s), output: String(hasDup) });
      }
    } else {
      desc = `Given a string, calculate its length and return the integer value.`;
      exampleInput = `s = "${exStr}"`;
      exampleOutput = String(exStr.length);
      testCases.push({ input: JSON.stringify(testStr), output: String(testStr.length) });
      for (let t = 0; t < 14; t++) {
          const s = randomString(randomInt(1, 20));
          testCases.push({ input: JSON.stringify(s), output: String(s.length) });
      }
    }
    constraints = ["1 <= s.length <= 10^5", "s consists of lower-case English letters."];
  }
  else if (topicId === 'graphs') {
    if (action === 'search') {
      desc = `Given a grid containing islands represented by '1's and water represented by '0's, find the number of islands.`;
      exampleInput = `grid = [["1","1","0"],["0","0","1"]]`;
      exampleOutput = "2";
      const initialGrid = [
        ["1","1","0","0","0"],
        ["1","1","0","0","0"],
        ["0","0","1","0","0"],
        ["0","0","0","1","1"]
      ];
      testCases.push({ input: JSON.stringify(initialGrid), output: String(solveNumIslands(initialGrid)) });
      for (let t = 0; t < 14; t++) {
          const rows = randomInt(3, 5);
          const cols = randomInt(3, 5);
          const grid = randomGrid(rows, cols);
          testCases.push({ input: JSON.stringify(grid), output: String(solveNumIslands(grid)) });
      }
    } else {
      desc = `Given a grid structure, process connectivity details.`;
      exampleInput = `grid = [[1,0],[0,1]]`;
      exampleOutput = "2";
      for (let t = 0; t < 15; t++) {
          const rows = randomInt(2, 6);
          const cols = randomInt(2, 6);
          const grid = randomGrid(rows, cols);
          testCases.push({ input: JSON.stringify(grid), output: String(grid.length) });
      }
    }
    constraints = ["1 <= grid.length, grid[i].length <= 300", "grid[i][j] is '0' or '1'."];
  }
  else {
    const testArr = [2, 7, 11, 15];
    const exArr = [1, 2, 3, 4];
    
    if (action === 'sum') {
      desc = `Given an array of integers, calculate and return the sum of all elements.`;
      exampleInput = `nums = ${JSON.stringify(exArr)}`;
      exampleOutput = String(exArr.reduce((a, b) => a + b, 0));
      if (title === 'Climbing Stairs') {
        for (let n = 1; n <= 15; n++) {
            testCases.push({ input: String(n), output: String(climbStairs(n)) });
        }
      } else {
        testCases.push({ input: JSON.stringify(testArr), output: String(testArr.reduce((a, b) => a + b, 0)) });
        for (let t = 0; t < 14; t++) {
            const len = randomInt(1, 10);
            const arr = randomArray(len, -50, 50);
            testCases.push({ input: JSON.stringify(arr), output: String(arr.reduce((a, b) => a + b, 0)) });
        }
      }
    } else if (action === 'max') {
      desc = `Given an array of integers, find and return the maximum value in the array.`;
      exampleInput = `nums = ${JSON.stringify(exArr)}`;
      exampleOutput = String(Math.max(...exArr));
      testCases.push({ input: JSON.stringify(testArr), output: String(Math.max(...testArr)) });
      for (let t = 0; t < 14; t++) {
          const len = randomInt(1, 10);
          const arr = randomArray(len, -100, 100);
          testCases.push({ input: JSON.stringify(arr), output: String(Math.max(...arr)) });
      }
    } else if (action === 'min') {
      desc = `Given an array of integers, find and return the minimum value in the array.`;
      exampleInput = `nums = ${JSON.stringify(exArr)}`;
      exampleOutput = String(Math.min(...exArr));
      testCases.push({ input: JSON.stringify(testArr), output: String(Math.min(...testArr)) });
      for (let t = 0; t < 14; t++) {
          const len = randomInt(1, 10);
          const arr = randomArray(len, -100, 100);
          testCases.push({ input: JSON.stringify(arr), output: String(Math.min(...arr)) });
      }
    } else if (action === 'count') {
      desc = `Given an array of integers, count and return the total number of elements.`;
      exampleInput = `nums = ${JSON.stringify(exArr)}`;
      exampleOutput = String(exArr.length);
      testCases.push({ input: JSON.stringify(testArr), output: String(testArr.length) });
      for (let t = 0; t < 14; t++) {
          const len = randomInt(1, 15);
          const arr = randomArray(len, -100, 100);
          testCases.push({ input: JSON.stringify(arr), output: String(arr.length) });
      }
    } else if (action === 'check_duplicates') {
      desc = `Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.`;
      exampleInput = `nums = [1,2,3,4]`;
      exampleOutput = 'false';
      testCases.push({ input: JSON.stringify([1, 2, 3, 1]), output: 'true' });
      testCases.push({ input: JSON.stringify([1, 2, 3, 4]), output: 'false' });
      for (let t = 0; t < 13; t++) {
          const len = randomInt(2, 10);
          const arr = randomArray(len, 1, 15);
          const hasDup = new Set(arr).size !== arr.length;
          testCases.push({ input: JSON.stringify(arr), output: String(hasDup) });
      }
    } else if (action === 'search') {
      desc = `Given an integer array nums and a target value, return the index of target if it exists, otherwise return -1.`;
      exampleInput = `nums = ${JSON.stringify(exArr)}, target = 3`;
      exampleOutput = String(exArr.indexOf(3));
      testCases.push({ input: `${JSON.stringify(testArr)}\n7`, output: String(testArr.indexOf(7)) });
      for (let t = 0; t < 14; t++) {
          const len = randomInt(1, 10);
          const arr = randomArray(len, 1, 30);
          const target = Math.random() > 0.5 ? arr[randomInt(0, len - 1)] : randomInt(31, 50);
          testCases.push({ input: `${JSON.stringify(arr)}\n${target}`, output: String(arr.indexOf(target)) });
      }
    } else {
      desc = `Given an array of integers, reverse the order of its elements and return the reversed array.`;
      exampleInput = `nums = ${JSON.stringify(exArr)}`;
      exampleOutput = JSON.stringify([...exArr].reverse());
      testCases.push({ input: JSON.stringify(testArr), output: JSON.stringify([...testArr].reverse()) });
      for (let t = 0; t < 14; t++) {
          const len = randomInt(1, 10);
          const arr = randomArray(len, -100, 100);
          testCases.push({ input: JSON.stringify(arr), output: JSON.stringify([...arr].reverse()) });
      }
    }
    constraints = ["1 <= nums.length <= 10^5", "-10^9 <= nums[i] <= 10^9"];
  }

  const testCaseInput = testCases[0]?.input || '';
  const testCaseOutput = testCases[0]?.output || '';

  return {
    action,
    desc,
    testCaseInput,
    testCaseOutput,
    testCases,
    exampleInput,
    exampleOutput,
    constraints
  };
}

const largeProblems = [];

const premiumSeeds = [
  { id: 'two-sum', title: 'Two Sum', topicId: 'arrays', difficulty: 'Easy', action: 'search' },
  { id: 'reverse-linked-list', title: 'Reverse Linked List', topicId: 'linkedlists', difficulty: 'Easy', action: 'reverse' },
  { id: 'climbing-stairs', title: 'Climbing Stairs', topicId: 'dp', difficulty: 'Easy', action: 'sum' },
  { id: 'binary-tree-inorder-traversal', title: 'Binary Tree Inorder Traversal', topicId: 'trees', difficulty: 'Easy', action: 'inorder' },
  { id: 'number-of-islands', title: 'Number of Islands', topicId: 'graphs', difficulty: 'Medium', action: 'search' }
];

console.log('Generating 1,800 real/realistic problems (60 Easy, 60 Medium, 60 Hard per topic)...');

topics.forEach(topic => {
  for (let dIdx = 0; dIdx < 3; dIdx++) {
    const diff = difficulties[dIdx];
    
    for (let count = 0; count < 60; count++) {
      const pIdx = dIdx * 60 + count;
      const seed = premiumSeeds.find(s => s.topicId === topic.id && s.difficulty === diff && count === 0);
      
      let probId = '';
      let title = '';
      let difficulty = diff;
      let actType = actions[pIdx % actions.length];

      if (seed) {
        probId = seed.id;
        title = seed.title;
        difficulty = seed.difficulty;
        if (seed.action === 'reverse') actType = 'Reverse';
        if (seed.action === 'search') actType = 'SearchValue';
      } else {
        const act = actions[pIdx % actions.length];
        const trg = targets[pIdx % targets.length];
        const cnd = conditions[pIdx % conditions.length];
        title = `${act} ${trg} ${cnd} ${pIdx + 1}`;
        probId = getSlug(title);
      }

      const funcName = getFunctionName(title);
      const logicDetails = getLogicAndOutput(title, topic.id);
      
      const templatesAndSol = getStarterCodeAndSolution(
        title, 
        funcName, 
        topic.id, 
        difficulty, 
        logicDetails.action, 
        logicDetails.testCaseInput, 
        logicDetails.testCaseOutput
      );

      const prob = {
        id: probId,
        title: title,
        slug: probId,
        difficulty: difficulty,
        topicId: topic.id,
        subtopicId: `${topic.id}-${difficulty.toLowerCase()}`,
        description: logicDetails.desc,
        constraints: logicDetails.constraints,
        examples: [
          {
            input: logicDetails.exampleInput,
            output: logicDetails.exampleOutput,
            explanation: `Let's perform the operation on the input to calculate: ${logicDetails.exampleOutput}.`
          }
        ],
        testCases: logicDetails.testCases,
        companies: [companies[pIdx % companies.length], companies[(pIdx + 3) % companies.length]],
        starterCode: templatesAndSol.starterCode,
        solution: templatesAndSol.solution
      };

      largeProblems.push(prob);
    }
  }
});

const dataDir = path.join(__dirname, '..', 'src', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const outputPath = path.join(dataDir, 'problemsDatabaseLarge.json');
fs.writeFileSync(outputPath, JSON.stringify(largeProblems, null, 2));

console.log(`Successfully generated ${largeProblems.length} problems in ${outputPath}!`);
